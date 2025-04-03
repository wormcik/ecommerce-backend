import express from 'express';
import { connectDB } from './connect.js'; 
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

const router = express.Router();

// Admin Backend Routes
router.post('/items', async (req, res) => {
  try {
    const { 
      name, 
      category, 
      description, 
      price, 
      seller, 
      image, 
      age,          
      material,      
      batteryLife,   
      size,
      author,           
    } = req.body;

    if (!name || !category || !description || !price || !seller || !image) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newItem = {
      name, 
      category, 
      description, 
      price: Number(price),
      seller, 
      image,
      rating: 0,       
      reviews: [],     
    };

    switch (category) {
      case 'vinyls':
        newItem.age = age || null; 
        break;
      case 'furniture':
        newItem.material = material || null;  
        break;
      case 'watches':
        newItem.batteryLife = batteryLife || null;  
        break;
      case 'shoes':
        newItem.size = size || null;  
        break;
      case 'books':
        newItem.author = author || null;  
        break;
      default:
        break;
    }

    const db = await connectDB();
    const result = await db.collection('items').insertOne(newItem);
    
    const insertedItem = await db.collection('items').findOne({ _id: result.insertedId });
    
    res.status(201).json({ message: 'Item added successfully', item: insertedItem });
  } catch (error) {
    console.error('Error in POST /items:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/users', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const db = await connectDB();
    const newItem = {
      username, 
      password: hashedPassword, 
      role, 
    };
    const result = await db.collection('users').insertOne(newItem);
    const insertedItem = await db.collection('users').findOne({ _id: result.insertedId });
    res.status(201).json({ message: 'User added successfully', item: insertedItem });
  } catch (error) {
    console.error('Error in POST /users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/items', async (req, res) => {
  try {
    const db = await connectDB();
    const items = await db.collection('items').find().toArray();
    res.json(items);
  } catch (error) {
    console.error('Error in GET /items:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const db = await connectDB();
    const users = await db.collection('users').find().toArray();
    res.json(users);
  } catch (error) {
    console.error('Error in GET /users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/items/:_id', async (req, res) => {
  try {
    const { _id } = req.params;
    const db = await connectDB();
    const result = await db.collection('items').deleteOne({ _id: new ObjectId(_id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /items/:_id:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/users/:_id', async (req, res) => {
  try {
    const { _id } = req.params;
    const db = await connectDB();
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(_id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  }
  catch (error) {
    console.error('Error in DELETE /users/:_id:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Login Backend Routes
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const db = await connectDB();
    const user = await db.collection('users').findOne({ username, password: hashedPassword });
    if (!user) {
      return res.status(401).json({ error: "Kullanıcı adı veya şifre hatalı!" });
    }
    res.status(200).json({ message: "Giriş başarılı!", user });
  } catch (error) {
    console.error('Error in POST /login:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// User Backend Routes
router.post('/rate', async (req, res) => {
  try {
    const { item_id, rating, review, user_id } = req.body;

    if (rating < 1 || rating > 10) {
      return res.status(400).json({ error: 'Invalid rating. Rating must be between 1 and 10.' });
    }

    if (!review || review.trim() === "") {
      return res.status(400).json({ error: 'Review cannot be empty.' });
    }

    const db = await connectDB();
    const item = await db.collection('items').findOne({ _id: new ObjectId(item_id) });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const existingReviewIndex = item.reviews ? item.reviews.findIndex(r => r.userId.toString() === user_id.toString()) : -1;

    if (existingReviewIndex === -1) {
      const newReview = {
        userId: new ObjectId(user_id), 
        rating,
        review,
        date: new Date()
      };

      await db.collection('items').updateOne(
        { _id: new ObjectId(item_id) },
        {
          $push: { reviews: newReview },
          $set: { rating: calculateAverageRating([...item.reviews, newReview]) } 
        }
      );
    } else {
      const updatedReview = { 
        ...item.reviews[existingReviewIndex],
        rating,
        review,
        date: new Date()
      };

      item.reviews[existingReviewIndex] = updatedReview;

      await db.collection('items').updateOne(
        { _id: new ObjectId(item_id) },
        {
          $set: {
            reviews: item.reviews,
            rating: calculateAverageRating(item.reviews) 
          }
        }
      );
    }

    res.status(200).json({ message: 'Rating and review submitted successfully' });
  } catch (error) {
    console.error('Error in POST /api/rate:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

function calculateAverageRating(reviews) {
  if (reviews && reviews.length > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
  }
  return 0; 
}


export default router;
