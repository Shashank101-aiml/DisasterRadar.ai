# Build context must be the repository root (D:\DisasterRadar), not backend/,
# because the trained model artifacts live in the sibling ../models directory
# that backend/config.py resolves relative to its own parent folder.
FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ backend/
COPY models/ models/

WORKDIR /app/backend

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
