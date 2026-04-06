const { MongoClient } = require('mongodb');

module.exports = async function handler(req, res) {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      return res.status(500).json({ error: 'MONGODB_URI not set' });
    }

    const client = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    
    await client.connect();
    await client.db('nursing-achievers').command({ ping: 1 });
    await client.close();

    return res.status(200).json({ success: true, message: 'MongoDB connected via native driver!' });
  } catch (error) {
    return res.status(500).json({ error: error.message, name: error.name });
  }
};
