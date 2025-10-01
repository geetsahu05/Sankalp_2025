const express = require('express');
const router = express.Router();
const Club = require('../models/Club');
const Event = require('../models/Event');

// Authentication middleware
const authenticate = (req, res, next) => {
  if (req.session.isAdmin) {
    next();
  } else {
    res.redirect('/admin/login');
  }
};

// Image display routes
router.get('/image/club/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club || !club.logo.data) {
      return res.status(404).send('Image not found');
    }
    
    res.set('Content-Type', club.logo.contentType);
    res.send(club.logo.data);
  } catch (error) {
    res.status(404).send('Image not found');
  }
});

router.get('/image/event/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || !event.poster.data) {
      return res.status(404).send('Image not found');
    }
    
    res.set('Content-Type', event.poster.contentType);
    res.send(event.poster.data);
  } catch (error) {
    res.status(404).send('Image not found');
  }
});

// Login routes
router.get('/login', (req, res) => {
  res.render('login', { 
    error: null,
    currentPage: 'login'  // Add this line
  });
});

router.post('/login', (req, res) => {
  if (req.body.username === 'admin' && req.body.password === 'admin123') {
    req.session.isAdmin = true;
    res.redirect('/admin');
  } else {
    res.render('login', { 
      error: 'Invalid credentials',
      currentPage: 'login'  // Add this line
    });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// Admin dashboard
router.get('/', authenticate, async (req, res) => {
  try {
    const clubs = await Club.find();
    const events = await Event.find().populate('club');
    res.render('admin/dashboard', { 
      clubs, 
      events,
      currentPage: 'dashboard'  // Add this
    });
  } catch (error) {
    res.status(500).send('Error loading dashboard');
  }
});


// Club management routes
router.get('/clubs', authenticate, async (req, res) => {
  try {
    const clubs = await Club.find();
    res.render('admin/clubs', { 
      clubs,
      currentPage: 'clubs'  // Add this
    });
  } catch (error) {
    res.status(500).send('Error loading clubs');
  }
});


router.post('/clubs', authenticate, async (req, res) => {
  try {
    const { name, description } = req.body;
    let logo = {};
    
    // Handle file upload if present
    if (req.files && req.files.logo) {
      const logoFile = req.files.logo;
      logo = {
        data: logoFile.data,
        contentType: logoFile.mimetype,
        filename: logoFile.name
      };
    }
    
    const club = new Club({ name, description, logo });
    await club.save();
    res.redirect('/admin/clubs');
  } catch (error) {
    console.error('Error creating club:', error);
    res.status(500).send('Error creating club');
  }
});

router.post('/clubs/:id/delete', authenticate, async (req, res) => {
  try {
    await Club.findByIdAndDelete(req.params.id);
    await Event.deleteMany({ club: req.params.id });
    res.redirect('/admin/clubs');
  } catch (error) {
    res.status(500).send('Error deleting club');
  }
});

// Event management routes
router.get('/events', authenticate, async (req, res) => {
  try {
    const events = await Event.find().populate('club');
    const clubs = await Club.find();
    res.render('admin/events', { 
      events, 
      clubs,
      currentPage: 'events'  // Add this
    });
  } catch (error) {
    res.status(500).send('Error loading events');
  }
});

router.post('/events', authenticate, async (req, res) => {
  try {
    const { name, description, club, venue, date, time, type, registration_link } = req.body;
    let poster = {};
    
    // Handle file upload if present
    if (req.files && req.files.poster) {
      const posterFile = req.files.poster;
      poster = {
        data: posterFile.data,
        contentType: posterFile.mimetype,
        filename: posterFile.name
      };
    }
    
    const event = new Event({
      name,
      description,
      club,
      venue,
      date,
      time,
      type,
      registration_link,
      poster
    });
    
    await event.save();
    res.redirect('/admin/events');
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).send('Error creating event');
  }
});

router.get('/events/:id/edit', authenticate, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('club');
    const clubs = await Club.find();
    res.render('admin/edit-event', { 
      event, 
      clubs,
      currentPage: 'events'  // This line is crucial
    });
  } catch (error) {
    res.status(500).send('Error loading event for editing');
  }
});

router.post('/events/:id/edit', authenticate, async (req, res) => {
  try {
    const { name, description, club, venue, date, time, type, registration_link } = req.body;
    const updateData = {
      name,
      description,
      club,
      venue,
      date,
      time,
      type,
      registration_link
    };
    
    // Handle file upload if present
    if (req.files && req.files.poster) {
      const posterFile = req.files.poster;
      updateData.poster = {
        data: posterFile.data,
        contentType: posterFile.mimetype,
        filename: posterFile.name
      };
    }
    
    await Event.findByIdAndUpdate(req.params.id, updateData);
    res.redirect('/admin/events');
  } catch (error) {
    // If there's an error, re-render the edit page with the currentPage variable
    const event = await Event.findById(req.params.id).populate('club');
    const clubs = await Club.find();
    res.render('admin/edit-event', { 
      event, 
      clubs,
      currentPage: 'events',  // Add this line
      error: 'Error updating event'
    });
  }
});

router.post('/events/:id/delete', authenticate, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.redirect('/admin/events');
  } catch (error) {
    res.status(500).send('Error deleting event');
  }
});

module.exports = router;