const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;
const DESIGNS_FILE = path.join(__dirname, 'public', 'designs.json');

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// Initialize designs file if it doesn't exist
if (!fs.existsSync(DESIGNS_FILE)) {
  fs.writeFileSync(DESIGNS_FILE, JSON.stringify({ designs: [] }, null, 2));
}

// Get all designs or designs by category
app.get('/api/designs', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DESIGNS_FILE, 'utf8'));
    const category = req.query.category;
    
    if (category) {
      const designs = data.designs.filter(d => d.category === category);
      res.json(designs);
    } else {
      res.json(data.designs);
    }
  } catch (error) {
    console.error('Error reading designs:', error);
    res.status(500).json({ error: 'Failed to read designs' });
  }
});

// Save or update a design
app.post('/api/designs', (req, res) => {
  try {
    const designData = req.body;
    const data = JSON.parse(fs.readFileSync(DESIGNS_FILE, 'utf8'));
    
    // Generate a unique ID
    const id = Date.now().toString();
    const design = {
      id,
      ...designData,
      createdAt: new Date().toISOString()
    };
    
    // Check if design with same name and category exists
    const existingIndex = data.designs.findIndex(
      d => d.name === designData.name && d.category === designData.category
    );
    
    if (existingIndex >= 0) {
      // Update existing design
      data.designs[existingIndex] = {
        ...data.designs[existingIndex],
        ...designData,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Add new design
      data.designs.push(design);
    }
    
    fs.writeFileSync(DESIGNS_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, id });
  } catch (error) {
    console.error('Error saving design:', error);
    res.status(500).json({ error: 'Failed to save design' });
  }
});

// Delete a design
app.delete('/api/designs/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = JSON.parse(fs.readFileSync(DESIGNS_FILE, 'utf8'));
    
    data.designs = data.designs.filter(d => d.id !== id);
    
    fs.writeFileSync(DESIGNS_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting design:', error);
    res.status(500).json({ error: 'Failed to delete design' });
  }
});

// Delete a design by name and category
app.delete('/api/designs', (req, res) => {
  try {
    const { name, category } = req.query;
    const data = JSON.parse(fs.readFileSync(DESIGNS_FILE, 'utf8'));
    
    data.designs = data.designs.filter(
      d => !(d.name === name && d.category === category)
    );
    
    fs.writeFileSync(DESIGNS_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting design:', error);
    res.status(500).json({ error: 'Failed to delete design' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Design API server running on http://localhost:${PORT}`);
});
