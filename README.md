# EasyNotes Canvas

EasyNotes Canvas is a modern, React-based drawing and annotation application that enables users to create and manage drawings in a collaborative environment. Built with TypeScript and leveraging the power of Redux for state management, it provides a robust platform for creating and managing visual content.

## Overview

The application currently supports:
- Creating and managing multiple drawing projects
- Basic shape drawing (rectangles, circles, lines)
- Text annotations
- Real-time shape manipulation (move, resize)
- Style customization (colors, stroke width)
- Project management with save/load functionality
- User authentication

## Demo

Try out EasyNotes Canvas: [Live Demo](https://startproject-easynotes.vercel.app)

Demo credentials:
- Username: `testuser`
- Password: `demo1234`

Backend repository: [EasyNotes Canvas API](https://github.com/igortosic-easymind/startproject-django-ninja-annotationApp)

### Note
The backend project is hosted on a free instance web service on Render. As a result, it may be idle sometimes, causing the initial load to be slow. However, once the application is loaded, it should work normally.

## Roadmap

We're actively working on expanding the application's capabilities. Upcoming features include:
- PDF document import and annotation
- Document markup capabilities
- Selection tool for multiple shape manipulation
- Image placement and manipulation
- Collaborative drawing features
- Export functionality
- Advanced shape styling options

## Tech Stack

- **Frontend Framework**: React 18
- **State Management**: Redux Toolkit
- **Canvas Library**: Konva.js
- **Styling**: 
  - Tailwind CSS
  - shadcn/ui components
- **Type Safety**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Code Quality**:
  - ESLint
  - TypeScript strict mode

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 16 or higher)
- npm or yarn
- Git

## Installation

1. Clone the repository:
```bash
git https://github.com/igortosic-easymind/startproject-react-redux-konva-annotationApp.git
cd startproject-react-redux-konva-annotationApp
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://your-backend-url/api
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── canvas/        # Canvas-related components
│   ├── ui/            # shadcn/ui components
│   └── ...
├── store/             # Redux store configuration
│   ├── slices/        # Redux slices
│   └── ...
├── shapes/            # Shape-related classes and utilities
├── services/          # API services
├── types/             # TypeScript types and interfaces
└── utils/             # Utility functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Konva.js](https://konvajs.org/) for the powerful canvas manipulation library
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Redux Toolkit](https://redux-toolkit.js.org/) for state management
- [Vite](https://vitejs.dev/) for the fast build tool

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

Built with ❤️ using React and TypeScript