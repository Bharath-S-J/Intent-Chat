import React, { useEffect, useState } from "react";
import { useContactsStore } from "../store/useContactsStore.js"; // adjust path
import toast from "react-hot-toast";

export default function ContactsPage() {
  const {
    contacts,
    isLoading,
    isAdding,
    isRemoving,
    fetchContacts,
    addContactByEmail,
    removeContact,
  } = useContactsStore();

  const [email, setEmail] = useState("");
  const [removingId, setRemovingId] = useState(null);

  // Fetch contacts on mount
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter an email");
      return;
    }
    await addContactByEmail(email.trim());
    setEmail("");
  };

  const confirmRemoveContact = async () => {
    if (!removingId) return;
    await removeContact(removingId);
    setRemovingId(null);
  };

  // Defensive check: contacts must be array
  const safeContacts = Array.isArray(contacts) ? contacts : [];

  return (
    <main className="max-w-3xl mx-auto p-4" aria-label="Contacts Page">
      <h1 className="text-2xl font-semibold mb-6">Contacts</h1>

      <form
        onSubmit={handleAddContact}
        className="flex gap-2 mb-6"
        aria-label="Add contact form"
      >
        <input
          type="email"
          placeholder="Enter email to add contact"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-grow border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          disabled={isAdding}
          required
          aria-required="true"
          aria-describedby="emailHelp"
        />
        <button
          type="submit"
          disabled={isAdding}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isAdding ? "Adding..." : "Add"}
        </button>
      </form>

      {isLoading ? (
        <p role="status" aria-live="polite">
          Loading contacts...
        </p>
      ) : safeContacts.length === 0 ? (
        <p>No contacts found.</p>
      ) : (
        <ul className="space-y-4" aria-label="List of contacts">
          {safeContacts.map((user) => (
  <li key={user._id} className="flex items-center justify-between border border-gray-200 rounded p-3">
    <div className="flex items-center gap-4">
      <img
        src={user.profilePic || "/avatar.png"}
        alt={user.fullName}
        className="w-12 h-12 rounded-full object-cover"
        loading="lazy"
      />
      <div>
        <p className="font-semibold">{user.fullName}</p>
        <p className="text-sm text-gray-600">{user.email}</p>
      </div>
    </div>

    <button
      onClick={() => setRemovingId(user._id)}
      disabled={isRemoving}
      className="text-red-600 hover:text-red-800 font-semibold"
      aria-label={`Remove contact ${user.fullName}`}
      type="button"
    >
      Remove
    </button>
  </li>
))}

        </ul>
      )}

      {/* Confirmation Modal */}
      {removingId && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-desc"
        >
          <div className="bg-white rounded shadow-lg max-w-sm w-full p-6">
            <h2 id="modal-title" className="text-lg font-semibold mb-4">
              Confirm Removal
            </h2>
            <p id="modal-desc" className="mb-6">
              Are you sure you want to remove this contact? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setRemovingId(null)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveContact}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                type="button"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
