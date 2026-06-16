import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

const client = axios.create({ baseURL });

/** Normalize backend `{ error: { code, message } }` into a thrown Error. */
function toError(err) {
  const data = err?.response?.data?.error;
  const message = data?.message || err.message || 'Request failed';
  const e = new Error(message);
  e.code = data?.code;
  e.status = err?.response?.status;
  return e;
}

export const api = {
  async listDocuments() {
    try {
      const { data } = await client.get('/documents');
      return data;
    } catch (e) {
      throw toError(e);
    }
  },

  async getDocument(id) {
    try {
      const { data } = await client.get(`/documents/${id}`);
      return data;
    } catch (e) {
      throw toError(e);
    }
  },

  async uploadDocument(file, onProgress) {
    const form = new FormData();
    form.append('file', file);
    try {
      const { data } = await client.post('/documents/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      });
      return data;
    } catch (e) {
      throw toError(e);
    }
  },

  async deleteDocument(id) {
    try {
      const { data } = await client.delete(`/documents/${id}`);
      return data;
    } catch (e) {
      throw toError(e);
    }
  },

  async ask(documentId, question) {
    try {
      const { data } = await client.post('/chat/ask', {
        document_id: documentId,
        question,
      });
      return data;
    } catch (e) {
      throw toError(e);
    }
  },

  async getHistory(documentId) {
    try {
      const { data } = await client.get(`/chat/${documentId}/history`);
      return data;
    } catch (e) {
      throw toError(e);
    }
  },

  async summarize(documentId) {
    try {
      const { data } = await client.post(`/documents/${documentId}/summary`);
      return data;
    } catch (e) {
      throw toError(e);
    }
  },
};

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '-';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}
