import { useEffect, useState } from 'react';
import Link from 'next/link';
import { documentService } from '@/services';
import { LoadingScreen, ErrorScreen } from '@/app/components';
import { DocumentHeader } from '@/types/document';

export default function Home() {
  const [documents, setDocuments] = useState<DocumentHeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await documentService.fetchDocuments();
        setDocuments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Невядомая памылка');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenu !== null) {
        setOpenMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openMenu]);

  const handleDownload = (documentId: number) => {
    window.open(`/api/registry-files/${documentId}/download`, '_blank');
  };

  const handleMenuClick = (event: React.MouseEvent, docId: number) => {
    event.stopPropagation();
    setOpenMenu(openMenu === docId ? null : docId);
  };

  const handleMenuActionClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenMenu(null);
  };

  if (loading) {
    return <LoadingScreen message="Загрузка дакумэнтаў..." />;
  }

  if (error) {
    return <ErrorScreen error={error} title="Памылка" showBackButton={false} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Загаловак */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Лінгвістычны рэдактар
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Выберыце дакумэнт для рэдагавання
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="inline-flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">Дэталі</span>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    style={{
                      backgroundColor: isExpanded ? '#3B82F6' : '#D1D5DB'
                    }}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                        isExpanded ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <Link
                  href="/docs/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Дадаць
                </Link>
              </div>
            </div>
          </div>

          {/* Табліца дакумэнтаў */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Назва
                  </th>
                  {isExpanded && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дата публікацыі
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Тып
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Стыль
                      </th>
                    </>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Прагрэс
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map(doc => (
                  <tr
                    key={doc.n}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {doc.n}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <Link
                        href={`/docs/${doc.n}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-150"
                      >
                        {doc.title}
                      </Link>
                    </td>
                    {isExpanded && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doc.publicationDate || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doc.url ? (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {doc.url.length > 30 ? `${doc.url.substring(0, 30)}...` : doc.url}
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doc.type || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doc.style || '-'}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${doc.percentCompletion}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900 font-medium">
                          {doc.percentCompletion}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="relative">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={(event) => handleMenuClick(event, doc.n)}
                            className="text-gray-400 hover:text-gray-600 transition-colors duration-150 p-1 rounded-full hover:bg-gray-100"
                            title="Дзеянні"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          
                          {openMenu === doc.n && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                              <div className="py-1">
                                <Link
                                  href={`/docs/${doc.n}/metadata`}
                                  onClick={handleMenuActionClick}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                                >
                                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Метаданыя
                                </Link>
                                <button
                                  onClick={(event) => {
                                    handleMenuActionClick(event);
                                    handleDownload(doc.n);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                                >
                                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Сцягнуць
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
