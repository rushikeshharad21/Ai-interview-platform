export default function WavyBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-[#F5F3FF] via-[#EEF2FF] to-[#E0E7FF]">
      <svg
        className="absolute bottom-0 left-0 w-full opacity-60"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="#C7D2FE"
          d="M0,192L60,197.3C120,203,240,213,360,229.3C480,245,600,267,720,261.3C840,256,960,224,1080,213.3C1200,203,1320,213,1380,218.7L1440,224L1440,320L0,320Z"
        />
      </svg>
      <svg
        className="absolute bottom-0 left-0 w-full opacity-40"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="#A5B4FC"
          d="M0,256L80,240C160,224,320,192,480,192C640,192,800,224,960,224C1120,224,1280,192,1360,176L1440,160L1440,320L0,320Z"
        />
      </svg>
    </div>
  )
}