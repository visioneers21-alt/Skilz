import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #6d28d9 0%, #8b5cf6 55%, #a78bfa 100%)',
          borderRadius: 40,
        }}
      >
        <svg
          width="98"
          height="98"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 16.5c2.2 0 3-1.2 3-3.4"
            stroke="white"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          <path
            d="M12 18.5V8.2c0-1.3 1-2.4 2.4-2.4 1.3 0 2.4 1 2.4 2.3 0 1.5-1.1 2.3-2.6 2.3H12"
            stroke="white"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  )
}
