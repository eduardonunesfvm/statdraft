import React from 'react'

interface PlayerAvatarProps {
  name: string
  size?: number
  className?: string
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  name,
  size = 64,
  className = '',
}) => {
  const seed = encodeURIComponent(name.trim())
  const avatarUrl = `https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}&backgroundColor=transparent`

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full bg-slate-800/80 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={avatarUrl}
        alt={`Avatar de ${name}`}
        width={size}
        height={size}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  )
}

export default PlayerAvatar