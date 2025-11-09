 Collaborative Canvas

A **real-time multi-user drawing application** built using **Vanilla JavaScript**, **Node.js**, and **Socket.IO**.  
This project allows multiple users to draw simultaneously on a shared canvas with smooth synchronization, chat support, and per-room collaboration.

---

 Features

###  Drawing Tools
- **Brush** and **Eraser** modes  
- Adjustable **color** and **stroke width**
- Real-time rendering across connected clients  
- Smooth, optimized path drawing  

### Canvas Management
- **Undo / Redo** actions (synced between users)
- **Clear canvas** option
- **Save & Load** canvas states (per room)
- **Download** the canvas as a `.png` image

###  Multi-User Collaboration
- Real-time sync using WebSockets (Socket.IO)
- **Online user tracking** (list of connected users)
- **Chat system** integrated in each room
- **Multiple rooms**: Main, Team A, Team B, Team C

###  Technical Stack
- **Frontend:** HTML5 Canvas + Tailwind CSS + Vanilla JavaScript  
- **Backend:** Node.js + Express + Socket.IO  
- **Communication:** Real-time event streaming via WebSockets  

---

##  Key Concepts Demonstrated

| Concept | Description |
|----------|--------------|
| **Canvas Mastery** | Efficient drawing, path management, optimized redraw |
| **Real-time Architecture** | Bidirectional data sync using Socket.IO |
| **State Synchronization** | Undo/Redo, clear, and save/load synced across users |
| **Conflict Handling** | Room-based isolation of events |
| **Scalability** | Modular backend design supporting multiple rooms |

---

##  Folder Structure


---

