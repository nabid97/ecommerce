const express = require('express');
const router = express.Router();
const { saveLogo, saveUploadedLogo } = require('../utils/LogoStorage');

// Endpoint for saving generated logos
router.post('/api/logos/generated', async (req, res) => {
  try {
    const { imageUrl, config } = req.body;
    
    const savedLogo = await saveLogo(imageUrl, config);
    
    // Save reference to database if needed
    await saveLogoToDatabase({
      url: savedLogo.url,
      filename: savedLogo.filename,
      path: savedLogo.path,
      companyName: config.text,
      type: 'generated',
      metadata: config
    });

    res.json(savedLogo);
  } catch (error) {
    console.error('Error in logo generation endpoint:', error);
    res.status(500).json({ error: 'Failed to save generated logo' });
  }
});

// Endpoint for saving uploaded logos
router.post('/api/logos/upload', async (req, res) => {
  try {
    const { file, companyName } = req.body;
    
    const savedLogo = await saveUploadedLogo(file, companyName);
    
    // Save reference to database if needed
    await saveLogoToDatabase({
      url: savedLogo.url,
      filename: savedLogo.filename,
      path: savedLogo.path,
      companyName: companyName,
      type: 'uploaded'
    });

    res.json(savedLogo);
  } catch (error) {
    console.error('Error in logo upload endpoint:', error);
    res.status(500).json({ error: 'Failed to save uploaded logo' });
  }
});

module.exports = router;