import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { NewsArticle } from '../../types';
import { Newspaper } from 'lucide-react';

export default function NewsList() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);

  useEffect(() => {
    const fetchArticles = async () => {
      const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setArticles(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsArticle)));
    };
    fetchArticles();
  }, []);

  return (
    <div className="p-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-800 dark:to-gray-900">
      <h1 className="text-2xl text-center font-bold mb-6 text-gray-800 dark:text-white">News & Updates</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article) => (
          <div key={article.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Newspaper className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{article.title}</h2>
            </div>
            <div className="mb-4">
              <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                {article.category}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{article.content}</p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(article.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}