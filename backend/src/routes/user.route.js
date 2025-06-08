import express from "express"
import { addContactByEmail, getContacts, removeContact  } from "../controllers/user.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router()

router.post("/contacts", protectRoute, addContactByEmail);
router.get('/contacts', protectRoute, getContacts);
router.post("/contacts/:contactUserId", protectRoute, removeContact);

export default router;