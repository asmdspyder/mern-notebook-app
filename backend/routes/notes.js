const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

// ROUTE 1 -- Get all the notes using GET "/api/notes/fetchallnotes"

router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.log(error);
    res.status(500).send("Some error occured");
  }
});

// ROUTE 2 -- Add a new note using  using POST "/api/notes/addnotes" Login required

router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],

  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      // if there are errors , return bad request and errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const saveNote = await note.save();

      res.json(saveNote);
    } catch (error) {
      console.log(error);
      res.status(500).send("Some error occured");
    }
  }
);

// ROUTE 3 -- Update an existing note using  using PUT "/api/notes/updatenote" Login required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
    const newNote = {};
    if (title) {
      newNote.title = title;
    }

    if (description) {
      newNote.description = description;
    }

    if (tag) {
      newNote.tag = tag;
    }

    //-- find the note that needed to be updated

    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("not found");
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not allowed");
    }

    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json(note);
  } catch (error) {
    console.log(error);
    res.status(500).send("Some error occured");
  }
});

// ROUTE 4 -- Delete an existing note using  using DELETE "/api/notes/deletenote/:id" Login required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    //-- find the note that needed to be deleted

    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("not found");
    }

    // allow deletion only when user owns this note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not allowed");
    }

    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note has been deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Some error occured");
  }
});

module.exports = router;
