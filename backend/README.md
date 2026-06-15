# FastAPI Cloudinary Example (backend)

This small example shows how to implement a server-side FastAPI app that:

- Stores image metadata (Cloudinary `public_id`, `secure_url`, title, description) in PostgreSQL.
- Deletes images from Cloudinary using server-side API credentials and removes the DB record.

Setup

1. Create a Python environment and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate  # or .\.venv\Scripts\activate on Windows
pip install -r requirements.txt
```

2. Create a `.env` file in this `backend/` folder with:

```
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. Run the app:

```bash
uvicorn fastapi_cloudinary_example:app --reload --port 8000
```

API

- `POST /images` — add a record after a client uploads to Cloudinary (payload: `public_id`, `secure_url`, `title`, `description`).
- `GET /images` — list saved images.
- `DELETE /images/{public_id}` — deletes the Cloudinary asset and removes the DB record.

Notes

- In production you should secure the endpoints (authentication + CSRF protection) and validate input.
- Deleting assets from Cloudinary should be guarded since it permanently removes files.
- Adjust DB migrations or use Alembic for production schema changes.
