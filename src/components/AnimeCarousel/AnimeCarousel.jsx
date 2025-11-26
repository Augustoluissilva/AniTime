import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom' // <-- IMPORTAÇÃO CHAVE
import './AnimeCarousel.css'

// Importando as imagens locais - caminho correto
import spyFamily from '../../assets/SPY_FAMILY.png'
import freeren from '../../assets/FREEREN.png'
import naruto from '../../assets/naruto.png'
import onePiece from '../../assets/one_piece.png'
import myHero from '../../assets/My_Hero.png'
import Mashle from '../../assets/Mashle.jpg'
import Bocchi_the_Rock from '../../assets/Bocchi_the_Rock.webp'
import Demon_Slayer from '../../assets/Demon_Slayer.webp'
import Maid_Dragon from '../../assets/Maid_Dragon.jpg'

const AnimeCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [navActive, setNavActive] = useState(false)
  const carouselRef = useRef(null)

  const animes = [
    {
      id: 1,
      title: 'SPY FAMILY',
      image: spyFamily,
      featured: false,
      slug: 'spy_family_s01e01'
    },
    {
      id: 2,
      title: 'FRIEREN',
      image: freeren,
      featured: true,
      slug: 'frieren_s01e01' // <-- SLUG REFERENTE AO MOCK DB
    },
    {
      id: 3,
      title: 'NARUTO',
      image: naruto,
      featured: false,
      slug: 'naruto_s01e01'
    },
    {
      id: 4,
      title: 'ONE PIECE',
      image: onePiece,
      featured: false,
      slug: 'one_piece_s01e01'
    },
    {
      id: 5,
      title: 'MY HERO ACADEMIA',
      image: myHero,
      featured: false,
      slug: 'my_hero_s01e01'
    },
    {
      id: 6,
      title: 'Mashle',
      image: Mashle,
      featured: false,
      slug: 'mashle_s01e01'
    },
    {
      id: 7,
      title: 'Bocchi the Rock',
      image: Bocchi_the_Rock,
      featured: false,
      slug: 'bocchi_s01e01'
    },
    {
      id: 8,
      title: 'DEMON SLAYER',
      image: Demon_Slayer,
      featured: false,
      slug: 'demon_slayer_s01e01'
    },
    {
      id: 9,
      title: 'Maid Dragon',
      image: Maid_Dragon,
      featured: false,
      slug: 'maid_dragon_s01e01'
    }
  ]

  const scrollToIndex = (index) => {
    if (carouselRef.current) {
      setNavActive(true)

      const card = carouselRef.current.children[index]
      if (card) {
        const cardWidth = card.offsetWidth
        const gap = 24
        const scrollPosition = index * (cardWidth + gap)

        carouselRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        })
        setCurrentIndex(index)

        setTimeout(() => {
          setNavActive(false)
        }, 400)
      }
    }
  }

  const nextSlide = () => {
    const nextIndex = (currentIndex + 1) % animes.length
    scrollToIndex(nextIndex)
  }

  const prevSlide = () => {
    const prevIndex = (currentIndex - 1 + animes.length) % animes.length
    scrollToIndex(prevIndex)
  }

  const handleScroll = () => {
    if (carouselRef.current && !navActive) {
      const scrollLeft = carouselRef.current.scrollLeft
      const cardWidth = carouselRef.current.children[0]?.offsetWidth || 300
      const gap = 24
      const newIndex = Math.round(scrollLeft / (cardWidth + gap))
      setCurrentIndex(newIndex)
    }
  }

  useEffect(() => {
    const handleResize = () => {
      if (carouselRef.current) {
        const scrollLeft = carouselRef.current.scrollLeft
        const cardWidth = carouselRef.current.children[0]?.offsetWidth || 300
        const gap = 24
        const newIndex = Math.round(scrollLeft / (cardWidth + gap))
        setCurrentIndex(newIndex)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <section className="carousel-section">
      <div className="carousel-container">
        <div className="carousel-header">
          <h2 className="section-title">Animes em Destaque</h2>
          <div className="carousel-controls">
            <button className="carousel-btn prev-btn" onClick={prevSlide}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="carousel-btn next-btn" onClick={nextSlide}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div
          className="carousel"
          ref={carouselRef}
          onScroll={handleScroll}
        >
          {animes.map((anime, index) => (
            // [MODIFICAÇÃO] Usa Link para navegar para o player.
            // Exemplo de link: /watch/spy-family/1
            <Link
              to={`/watch/${anime.title.toLowerCase().replace(/ /g, '-')}/1`}
              key={anime.id}
              className={`anime-card ${anime.featured ? 'featured' : ''} ${index === currentIndex ? 'active' : ''
                } ${navActive && index === currentIndex ? 'nav-active' : ''}`}
              style={{ textDecoration: 'none' }} // Garantir que não haja sublinhado
            >
              <div className="card-image">
                <img src={anime.image} alt={anime.title} />
                <div className="card-overlay">
                  <h3 className="anime-title">{anime.title}</h3>
                </div>
              </div>
              <div className="card-glow"></div>
            </Link>
          ))}
        </div>

        <div className="carousel-indicators">
          {animes.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default AnimeCarousel