import React from 'react';
import { Link } from 'react-router-dom';
import type { Article } from '../../types/blog';
import { ArrowRight, Clock, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

interface RelatedPostsProps {
  currentArticle: Article;
  allArticles: Article[];
}

export const RelatedPosts: React.FC<RelatedPostsProps> = ({ currentArticle, allArticles }) => {
  // Find related articles: same category or matching tags, excluding current
  const related = allArticles
    .filter(a => a.id !== currentArticle.id && a.status === 'published')
    .map(a => {
      let score = 0;
      if (a.category.toLowerCase() === currentArticle.category.toLowerCase()) score += 3;
      const commonTags = a.tags.filter(t => currentArticle.tags.includes(t));
      score += commonTags.length * 2;
      return { article: a, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.article);

  if (related.length === 0) return null;

  return (
    <div className="my-16 pt-12 border-t border-[#EBE6D6]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-xs font-medium text-[#256B3A]">
            Chhiar Zau Duh Tan
          </span>
          <h3 className="font-serif font-semibold text-2xl text-[#143520] mt-0.5">
            Hriatzauna Thuziak Dangte
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map(art => (
          <div
            key={art.id}
            className="group bg-white rounded-2xl border border-[#EBE6D6] hover:border-[#DDD4BC] overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-xs transition-colors"
          >
            <div>
              <div className="relative aspect-16/10 overflow-hidden bg-[#EBE6D6]">
                <Link to={`/article/${art.slug}`}>
                  <img
                    src={art.coverImage}
                    alt={art.title}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <span className="absolute top-2.5 left-2.5 text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#143520] text-[#BFDC28]">
                  {art.category}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center gap-3 text-[11px] text-[#6F5B3C] font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {formatDate(art.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Min {art.readingTimeMinutes}
                  </span>
                </div>
                <h4 className="font-serif font-semibold text-base text-[#143520] group-hover:text-[#256B3A] line-clamp-2 leading-snug">
                  <Link to={`/article/${art.slug}`}>{art.title}</Link>
                </h4>
              </div>
            </div>

            <div className="p-4 pt-0">
              <Link
                to={`/article/${art.slug}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#256B3A] hover:text-[#143520] pt-2 border-t border-[#F6F4EB] w-full"
              >
                <span>Chhiar chhunzawm rawh</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

