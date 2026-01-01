export default function PreviewPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="fantasy-header text-5xl mb-4">BookQuest Design Preview</h1>
          <p className="text-lg text-[--navy]">
            This is how your fantasy-themed reading app will look!
          </p>
        </div>

        {/* Color Palette */}
        <section className="parchment-card p-6">
          <h2 className="fantasy-header text-3xl mb-6">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-full h-24 rounded-lg bg-[--parchment] border-2 border-[--brown]"></div>
              <p className="mt-2 text-sm font-semibold">Parchment</p>
              <p className="text-xs text-[--brown]">#F5E6D3</p>
            </div>
            <div className="text-center">
              <div className="w-full h-24 rounded-lg bg-[--navy] border-2 border-[--brown]"></div>
              <p className="mt-2 text-sm font-semibold">Navy</p>
              <p className="text-xs text-[--brown]">#2C3E50</p>
            </div>
            <div className="text-center">
              <div className="w-full h-24 rounded-lg bg-[--gold] border-2 border-[--brown]"></div>
              <p className="mt-2 text-sm font-semibold">Gold</p>
              <p className="text-xs text-[--brown]">#D4AF37</p>
            </div>
            <div className="text-center">
              <div className="w-full h-24 rounded-lg bg-[--brown] border-2 border-[--brown]"></div>
              <p className="mt-2 text-sm font-semibold">Brown</p>
              <p className="text-xs text-[--brown]">#8B4513</p>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="parchment-card p-6">
          <h2 className="fantasy-header text-3xl mb-6">Typography</h2>
          <div className="space-y-4">
            <div>
              <p className="fantasy-header text-4xl">Book Quest</p>
              <p className="text-sm text-[--brown] mt-1">Cinzel - Fantasy Headers</p>
            </div>
            <div>
              <p className="text-xl">
                Once upon a time, there was a young reader who embarked on a magical quest through the pages of countless books...
              </p>
              <p className="text-sm text-[--brown] mt-1">Lora - Body Text (serif)</p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="parchment-card p-6">
          <h2 className="fantasy-header text-3xl mb-6">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <button className="fantasy-button">
              Add New Book
            </button>
            <button className="fantasy-button opacity-75 cursor-not-allowed">
              Disabled Button
            </button>
            <button className="px-6 py-3 bg-[--navy] text-[--cream] rounded-lg font-semibold hover:bg-[--navy-dark] transition border-2 border-[--gold]">
              Secondary Button
            </button>
          </div>
        </section>

        {/* Cards */}
        <section className="parchment-card p-6">
          <h2 className="fantasy-header text-3xl mb-6">Cards & Frames</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Parchment Card */}
            <div className="parchment-card p-6">
              <h3 className="fantasy-header text-xl mb-3">Parchment Card</h3>
              <p className="text-[--foreground]">
                This is how content cards will look throughout the app. Notice the subtle texture!
              </p>
            </div>

            {/* Ornate Frame (Book Cover) */}
            <div className="ornate-frame p-4 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-48 bg-gradient-to-br from-[--navy] to-[--navy-dark] rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-[--gold] text-6xl">📚</span>
                </div>
                <p className="font-semibold">Book Cover Frame</p>
              </div>
            </div>
          </div>
        </section>

        {/* Progress Bars */}
        <section className="parchment-card p-6">
          <h2 className="fantasy-header text-3xl mb-6">Progress Bars</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Harry Potter - 60% Complete</span>
                <span className="text-[--brown]">192 / 320 pages</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: '60%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">The Hobbit - 25% Complete</span>
                <span className="text-[--brown]">75 / 300 pages</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: '25%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Matilda - 100% Complete</span>
                <span className="text-[--brown]">240 / 240 pages</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Friend Card Example */}
        <section className="parchment-card p-6">
          <h2 className="fantasy-header text-3xl mb-6">Friend Cards</h2>
          <div className="space-y-4">
            {[
              { name: 'Magnus', book: 'Pippi Långstrump', progress: 75, avatar: '👦' },
              { name: 'Lieke', book: 'Jip en Janneke', progress: 45, avatar: '👧' },
              { name: 'Erik', book: 'Het Geheim', progress: 90, avatar: '🧒' },
            ].map((friend) => (
              <div key={friend.name} className="flex items-center gap-4 p-4 bg-[--cream] rounded-xl border-2 border-[--gold]">
                <div className="w-16 h-16 rounded-full bg-[--navy] flex items-center justify-center text-3xl border-4 border-[--gold]">
                  {friend.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg">{friend.name}</p>
                  <p className="text-sm text-[--brown] mb-2">{friend.book}</p>
                  <div className="progress-bar-container h-3">
                    <div className="progress-bar-fill" style={{ width: `${friend.progress}%` }}></div>
                  </div>
                </div>
                <div className="w-12 h-16 bg-gradient-to-br from-[--navy] to-[--navy-dark] rounded flex items-center justify-center text-2xl">
                  📖
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Book Cover Grid */}
        <section className="parchment-card p-6">
          <h2 className="fantasy-header text-3xl mb-6">Book Collections</h2>
          <div className="grid grid-cols-3 gap-4">
            {['🔮', '⚔️', '🏰', '🐉', '📜', '🗝️'].map((icon, i) => (
              <div key={i} className="ornate-frame p-3 text-center cursor-pointer hover:scale-105 transition">
                <div className="w-full h-32 bg-gradient-to-br from-[--navy] to-[--navy-dark] rounded-lg flex items-center justify-center text-5xl mb-2">
                  {icon}
                </div>
                <p className="text-sm font-semibold">Book {i + 1}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Star Rating */}
        <section className="parchment-card p-6">
          <h2 className="fantasy-header text-3xl mb-6">Star Rating</h2>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="text-4xl transition hover:scale-110"
                style={{ color: star <= 4 ? '#D4AF37' : '#8B4513' }}
              >
                {star <= 4 ? '⭐' : '☆'}
              </button>
            ))}
            <span className="ml-4 text-lg font-semibold">4 out of 5 stars</span>
          </div>
        </section>

        {/* Bottom Navigation Preview */}
        <section className="parchment-card p-6">
          <h2 className="fantasy-header text-3xl mb-6">Bottom Navigation</h2>
          <div className="bg-[--navy] rounded-xl p-4 max-w-md mx-auto">
            <div className="flex justify-around items-center">
              {[
                { icon: '📚', label: 'Library' },
                { icon: '❤️', label: 'Favorites' },
                { icon: '👥', label: 'Friends' },
                { icon: '🏠', label: 'Home', active: true },
              ].map((item) => (
                <button
                  key={item.label}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
                    item.active ? 'bg-[--gold]' : 'hover:bg-[--navy-dark]'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className={`text-xs font-semibold ${item.active ? 'text-[--navy]' : 'text-[--cream]'}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile Preview */}
        <section className="parchment-card p-6">
          <h2 className="fantasy-header text-3xl mb-6">Mobile Home Screen Preview</h2>
          <div className="max-w-sm mx-auto bg-[--navy] rounded-3xl p-6 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="fantasy-header text-2xl text-[--gold] mb-2">Book Quest</h3>
            </div>

            {/* Currently Reading */}
            <div className="parchment-card p-4 mb-6">
              <div className="text-center mb-4">
                <div className="ornate-frame p-2 inline-block mb-3">
                  <div className="w-32 h-48 bg-gradient-to-br from-red-800 to-red-900 rounded-lg flex items-center justify-center text-4xl">
                    📕
                  </div>
                </div>
                <p className="font-semibold text-lg">Harry Potter</p>
                <p className="text-sm text-[--brown]">J.K. Rowling</p>
              </div>

              <div className="progress-bar-container mb-2">
                <div className="progress-bar-fill" style={{ width: '60%' }}></div>
              </div>
              <p className="text-center text-sm font-semibold text-[--brown]">60% Complete</p>
            </div>

            {/* Friends Section */}
            <div className="parchment-card p-4">
              <p className="fantasy-header text-lg mb-3">Friends</p>
              <div className="space-y-3">
                {[
                  { name: 'Magnus', progress: 75 },
                  { name: 'Lieke', progress: 45 },
                ].map((friend) => (
                  <div key={friend.name} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[--navy] flex items-center justify-center text-xl border-2 border-[--gold]">
                      👤
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{friend.name}</p>
                      <div className="progress-bar-container h-2">
                        <div className="progress-bar-fill" style={{ width: `${friend.progress}%` }}></div>
                      </div>
                    </div>
                    <div className="w-8 h-10 bg-[--navy] rounded flex items-center justify-center text-sm">
                      📖
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Nav */}
            <div className="mt-6 bg-[--navy-dark] rounded-xl p-3">
              <div className="flex justify-around">
                {['📚', '❤️', '👥', '🏠'].map((icon, i) => (
                  <button
                    key={i}
                    className={`text-2xl p-2 rounded-lg ${i === 3 ? 'bg-[--gold]' : ''}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-8 text-[--brown]">
          <p className="text-sm">This is how BookQuest will look on mobile! 📱📚</p>
          <p className="text-xs mt-2">Scroll up to see all design elements</p>
        </div>
      </div>
    </div>
  )
}
