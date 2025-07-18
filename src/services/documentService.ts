import { DocumentData, ParadigmFormId, GrammarInfo, DocumentHeader } from '@/types/document';

interface CreateDocumentData {
  n: number;
  title: string;
  url?: string;
  publicationDate?: string;
  textType: 'вусны' | 'пісьмовы';
  style?: 'публіцыстычны' | 'мастацкі' | 'афіцыйна-справавы' | 'навуковы' | 'гутарковы';
  file: File;
}

export class DocumentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  }

  async fetchDocuments(): Promise<DocumentHeader[]> {
    const response = await fetch('/api/registry-files');
    if (!response.ok) {
      throw new Error('Памылка загрузкі дакумэнтаў');
    }
    const data = await response.json();
    data.sort((a: DocumentHeader, b: DocumentHeader) => a.n - b.n);
    return data;
  }

  async createDocument(documentData: CreateDocumentData): Promise<void> {
    const formData = new FormData();
    formData.append('n', documentData.n.toString());
    formData.append('title', documentData.title);
    if (documentData.url) formData.append('url', documentData.url);
    if (documentData.publicationDate) formData.append('publicationDate', documentData.publicationDate.toString());
    formData.append('textType', documentData.textType);
    if (documentData.style) formData.append('style', documentData.style);
    formData.append('file', documentData.file);

    const response = await fetch('/api/registry-files', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Памылка пры загрузцы файла');
    }
  }

  async fetchDocument(
    documentId: string,
    skipUpToId: number = 0
  ): Promise<DocumentData> {
    const url = new URL(`/api/registry-files/${documentId}`, this.baseUrl);
    url.searchParams.set('skipUpToId', skipUpToId.toString());
    url.searchParams.set('take', '20');

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Не ўдалося загрузіць дакумэнт');
    }
    return response.json();
  }

  async fetchDocumentMetadata(documentId: number): Promise<DocumentHeader> {
    const response = await fetch(`/api/registry-files/${documentId}/metadata`);
    if (!response.ok) {
      throw new Error('Не ўдалося загрузіць метаданыя дакумента');
    }
    return response.json();
  }

  async updateMetadata(documentId: number, metadata: Omit<DocumentHeader, 'n' | 'percentCompletion' | 'author' | 'language'>): Promise<void> {
    const response = await fetch(`/api/registry-files/${documentId}/metadata`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Не ўдалося абнавіць метаданыя');
    }
  }

  async saveParadigmFormId(
    documentId: string,
    paragraphId: number,
    paragraphStamp: string,
    sentenceId: number,
    sentenceStamp: string,
    wordIndex: number,
    paradigmFormId: ParadigmFormId
  ): Promise<void> {
    const url = `/api/registry-files/${documentId}/${paragraphId}.${paragraphStamp}/${sentenceId}.${sentenceStamp}/${wordIndex}/paradigm-form-id`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paradigmFormId),
    });

    if (!response.ok) {
      throw new Error('Не ўдалося захаваць змены');
    }
  }

  async updateWordText(
    documentId: string,
    paragraphId: number,
    paragraphStamp: string,
    sentenceId: number,
    sentenceStamp: string,
    wordIndex: number,
    text: string
  ): Promise<GrammarInfo[]> {
    const url = `/api/registry-files/${documentId}/${paragraphId}.${paragraphStamp}/${sentenceId}.${sentenceStamp}/${wordIndex}/text`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(text),
    });

    if (!response.ok) {
      throw new Error('Не ўдалося змяніць тэкст слова');
    }

    return response.json();
  }

  async saveLemmaTag(
    documentId: string,
    paragraphId: number,
    paragraphStamp: string,
    sentenceId: number,
    sentenceStamp: string,
    wordIndex: number,
    lemma: string,
    linguisticTag: string
  ): Promise<void> {
    const url = `/api/registry-files/${documentId}/${paragraphId}.${paragraphStamp}/${sentenceId}.${sentenceStamp}/${wordIndex}/lemma-tag`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lemma, linguisticTag }),
    });

    if (!response.ok) {
      throw new Error('Не ўдалося захаваць лінгвістычныя катэгорыі');
    }
  }

  async saveComment(
    documentId: string,
    paragraphId: number,
    paragraphStamp: string,
    sentenceId: number,
    sentenceStamp: string,
    wordIndex: number,
    comment: string
  ): Promise<void> {
    const url = `/api/registry-files/${documentId}/${paragraphId}.${paragraphStamp}/${sentenceId}.${sentenceStamp}/${wordIndex}/comment`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comment),
    });

    if (!response.ok) {
      throw new Error('Не ўдалося захаваць каментар');
    }
  }
}

export const documentService = new DocumentService();
