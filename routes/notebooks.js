import express from "express";
import NoteBook from "../models/NoteBook.js";
import Note from "../models/Notes.js";
import { authMiddleware } from "../utils/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const notebooks = await NoteBook.find({ user: req.user._id })
    .populate("notes");
    res.json(notebooks);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/", async (req, res) => {
  try {
    const notebook = await NoteBook.create({
      ...req.body,
      user: req.user._id,
    });
    res.status(201).json(notebook);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:notebookId/add/:noteId', async(req, res) => {
  try {
    const notebook = await NoteBook.findById(req.params.notebookId);
    
    if (!notebook) {
      return res.status(404).json({ message: 'Notebook not found' });
    }

    if (notebook.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User is not authorized to add notes to this notebook' });
    }

    const note = await Note.findById(req.params.noteId);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    notebook.notes.push(note._id);
    await notebook.save();
    
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json(err);
  }
})


export default router;