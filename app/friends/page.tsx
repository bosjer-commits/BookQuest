'use client';

import { useState } from 'react';
import Image from 'next/image';
import BottomNav from '@/components/BottomNav';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useCurrentBook } from '@/contexts/CurrentBookContext';

// Mock friends data
const mockFriends = [
  {
    id: 1,
    name: 'Emma',
    avatar: '👧',
    currentBook: {
      title: 'Frozen',
      author: 'Unknown',
      coverUrl: null,
      progress: 75
    }
  },
  {
    id: 2,
    name: 'Sarah',
    avatar: '👩',
    currentBook: {
      title: 'Charlie and the Chocolate Factory',
      author: 'Roald Dahl',
      coverUrl: null,
      progress: 45
    }
  }
];

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<'favorite' | 'reading'>('favorite');
  const { favorites } = useFavorites();
  const { currentBook, inProgressBooks } = useCurrentBook();

  // Get books for display based on active tab
  const displayBooks = activeTab === 'favorite'
    ? favorites.slice(0, 2)
    : currentBook
      ? [{ book: currentBook.book, coverUrl: currentBook.coverUrl }, ...inProgressBooks.slice(0, 1)]
      : inProgressBooks.slice(0, 2);

  // Find friends reading the same book as current book
  const sharedReadings = currentBook
    ? mockFriends.filter(friend =>
        friend.currentBook.title === currentBook.book.title
      )
    : [];

  return (
    <div className="h-full flex flex-col">
      <main className="flex-1 px-6 py-4">
        <div className="parchment-card p-6">
          {/* User Profile */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-navy border-4 border-gold flex items-center justify-center text-4xl overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-navy-light to-navy-dark flex items-center justify-center">
                👤
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 justify-center mb-6">
            <button
              onClick={() => setActiveTab('favorite')}
              className={`px-6 py-2 rounded-full font-serif text-sm transition-colors ${
                activeTab === 'favorite'
                  ? 'bg-navy border-2 border-gold text-gold'
                  : 'bg-parchment-light border-2 border-brown-text text-brown-text hover:bg-parchment'
              }`}
            >
              My favorite
            </button>
            <button
              onClick={() => setActiveTab('reading')}
              className={`px-6 py-2 rounded-full font-serif text-sm transition-colors ${
                activeTab === 'reading'
                  ? 'bg-navy border-2 border-gold text-gold'
                  : 'bg-parchment-light border-2 border-brown-text text-brown-text hover:bg-parchment'
              }`}
            >
              Reading
            </button>
          </div>

          {/* Book Display */}
          <div className="flex justify-center gap-4 mb-8">
            {displayBooks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-brown-text text-sm">
                  {activeTab === 'favorite'
                    ? 'No favorites yet'
                    : 'Not reading anything yet'}
                </p>
              </div>
            ) : (
              displayBooks.map((item, index) => (
                <div key={index} className="w-32 h-44 bg-navy border-2 border-gold rounded shadow-lg overflow-hidden">
                  {item.coverUrl ? (
                    <Image
                      src={item.coverUrl}
                      alt={item.book.title}
                      width={128}
                      height={176}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-navy-light to-navy-dark flex items-center justify-center p-3">
                      <div className="text-center">
                        <p className="text-gold text-xs font-bold line-clamp-3">
                          {item.book.title}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Friend Comparisons */}
          {sharedReadings.length > 0 && (
            <div className="space-y-4">
              {sharedReadings.map((friend) => (
                <div key={friend.id} className="flex items-center justify-center gap-4">
                  {/* Current user's book */}
                  <div className="w-16 h-22 bg-navy border border-gold rounded shadow overflow-hidden flex-shrink-0">
                    {currentBook?.coverUrl ? (
                      <Image
                        src={currentBook.coverUrl}
                        alt={currentBook.book.title}
                        width={64}
                        height={88}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-navy-light to-navy-dark" />
                    )}
                  </div>

                  {/* Friend avatar */}
                  <div className="w-16 h-16 rounded-full bg-pink-200 border-4 border-gold flex items-center justify-center text-2xl flex-shrink-0">
                    {friend.avatar}
                  </div>

                  {/* Friend's book (same book) */}
                  <div className="w-16 h-22 bg-navy border border-gold rounded shadow overflow-hidden flex-shrink-0">
                    {currentBook?.coverUrl ? (
                      <Image
                        src={currentBook.coverUrl}
                        alt={currentBook.book.title}
                        width={64}
                        height={88}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-navy-light to-navy-dark" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* All Friends List */}
          {mockFriends.length > 0 && sharedReadings.length === 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="fantasy-header text-base text-navy text-center mb-4">Friends Reading</h3>
              {mockFriends.map((friend) => (
                <div key={friend.id} className="flex items-center gap-3 p-3 bg-parchment-light rounded">
                  {/* Friend avatar */}
                  <div className="w-12 h-12 rounded-full bg-pink-200 border-2 border-gold flex items-center justify-center text-xl flex-shrink-0">
                    {friend.avatar}
                  </div>

                  {/* Friend book */}
                  <div className="w-10 h-14 bg-navy border border-gold rounded shadow-sm overflow-hidden flex-shrink-0">
                    <div className="w-full h-full bg-gradient-to-br from-navy-light to-navy-dark" />
                  </div>

                  {/* Friend info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-navy text-sm font-bold">{friend.name}</p>
                    <p className="text-brown-text text-xs truncate">{friend.currentBook.title}</p>
                  </div>

                  {/* Progress */}
                  <div className="w-16 flex-shrink-0">
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${friend.currentBook.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav active="friends" />
    </div>
  );
}
