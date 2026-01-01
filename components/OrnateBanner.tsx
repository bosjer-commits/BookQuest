export default function OrnateBanner() {
  return (
    <div className="relative w-full px-6 py-4" style={{ minHeight: '80px' }}>
      <svg
        width="100%"
        height="70"
        viewBox="0 0 360 70"
        className="max-w-md mx-auto"
        style={{ display: 'block' }}
      >
        {/* Define gradients */}
        <defs>
          {/* Navy gradient for ribbon */}
          <linearGradient id="navyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#2d4d6f', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#1e3a5f', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#152844', stopOpacity: 1 }} />
          </linearGradient>

          {/* Gold gradient for border */}
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#e8c89a', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#d4a574', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#c9a05c', stopOpacity: 1 }} />
          </linearGradient>

          {/* Dark shadow for depth */}
          <linearGradient id="shadowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#0a0f15', stopOpacity: 0.5 }} />
            <stop offset="100%" style={{ stopColor: '#0a0f15', stopOpacity: 0.8 }} />
          </linearGradient>
        </defs>

        {/* Shadow layer (behind ribbon) */}
        <path
          d="M 20 35 L 30 30 L 330 30 L 340 35 L 330 40 L 30 40 Z"
          fill="url(#shadowGradient)"
          opacity="0.4"
        />

        {/* Left ribbon tail */}
        <path
          d="M 30 15 L 15 30 L 30 45 L 30 15 Z"
          fill="url(#navyGradient)"
          stroke="url(#goldGradient)"
          strokeWidth="2"
        />
        <path
          d="M 30 15 L 15 30 L 30 45"
          fill="none"
          stroke="#152844"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Main ribbon body */}
        <rect
          x="30"
          y="15"
          width="300"
          height="30"
          rx="4"
          fill="url(#navyGradient)"
          stroke="url(#goldGradient)"
          strokeWidth="2.5"
        />

        {/* Inner gold trim */}
        <rect
          x="34"
          y="19"
          width="292"
          height="22"
          rx="3"
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth="1"
          opacity="0.6"
        />

        {/* Highlight on top edge */}
        <rect
          x="32"
          y="15"
          width="296"
          height="8"
          rx="4"
          fill="url(#navyGradient)"
          opacity="0.3"
        />

        {/* Right ribbon tail */}
        <path
          d="M 330 15 L 345 30 L 330 45 L 330 15 Z"
          fill="url(#navyGradient)"
          stroke="url(#goldGradient)"
          strokeWidth="2"
        />
        <path
          d="M 330 15 L 345 30 L 330 45"
          fill="none"
          stroke="#152844"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Decorative corner accents */}
        <circle cx="40" cy="30" r="2" fill="url(#goldGradient)" opacity="0.8" />
        <circle cx="320" cy="30" r="2" fill="url(#goldGradient)" opacity="0.8" />

        {/* Text */}
        <text
          x="180"
          y="42"
          textAnchor="middle"
          fontFamily="Cinzel, serif"
          fontSize="26"
          fontWeight="700"
          fill="#d4a574"
          letterSpacing="2"
        >
          Book Quest
        </text>
      </svg>
    </div>
  );
}
