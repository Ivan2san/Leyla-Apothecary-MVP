import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { HeroBanner } from '../hero-banner'

describe('HeroBanner', () => {
  const defaultProps = {
    title: 'Test Title',
    imageSrc: 'https://images.unsplash.com/photo-test',
    imageAlt: 'Test image',
  }

  it('renders without crashing', () => {
    render(<HeroBanner {...defaultProps} />)
    expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument()
  })

  describe('Text Content', () => {
    it('renders title', () => {
      render(<HeroBanner {...defaultProps} />)
      expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument()
    })

    it('renders optional subtitle when provided', () => {
      render(<HeroBanner {...defaultProps} subtitle="Test Subtitle" />)
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
    })

    it('does not render subtitle when not provided', () => {
      render(<HeroBanner {...defaultProps} />)
      expect(screen.queryByText('Test Subtitle')).not.toBeInTheDocument()
    })

    it('renders optional description when provided', () => {
      render(<HeroBanner {...defaultProps} description="Test Description" />)
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('does not render description when not provided', () => {
      render(<HeroBanner {...defaultProps} />)
      expect(screen.queryByText('Test Description')).not.toBeInTheDocument()
    })
  })

  describe('CTAs', () => {
    it('renders primary CTA when provided', () => {
      render(
        <HeroBanner
          {...defaultProps}
          primaryCTA={{ text: 'Primary Action', href: '/primary' }}
        />
      )
      const link = screen.getByRole('link', { name: 'Primary Action' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/primary')
    })

    it('renders secondary CTA when provided', () => {
      render(
        <HeroBanner
          {...defaultProps}
          secondaryCTA={{ text: 'Secondary Action', href: '/secondary' }}
        />
      )
      const link = screen.getByRole('link', { name: 'Secondary Action' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/secondary')
    })

    it('renders both CTAs when both are provided', () => {
      render(
        <HeroBanner
          {...defaultProps}
          primaryCTA={{ text: 'Primary', href: '/primary' }}
          secondaryCTA={{ text: 'Secondary', href: '/secondary' }}
        />
      )
      expect(screen.getByRole('link', { name: 'Primary' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Secondary' })).toBeInTheDocument()
    })

    it('does not render CTA section when no CTAs provided', () => {
      const { container } = render(<HeroBanner {...defaultProps} />)
      const links = container.querySelectorAll('a')
      expect(links).toHaveLength(0)
    })

    it('applies brand terracotta color to primary CTA', () => {
      render(
        <HeroBanner
          {...defaultProps}
          primaryCTA={{ text: 'Primary', href: '/primary' }}
        />
      )
      const button = screen.getByRole('button', { name: 'Primary' })
      expect(button).toHaveClass('bg-[#D98C4A]')
    })
  })

  describe('Height Variants', () => {
    it('applies small height class', () => {
      const { container } = render(<HeroBanner {...defaultProps} height="small" />)
      const section = container.querySelector('section')
      expect(section).toHaveClass('h-[300px]')
    })

    it('applies medium height class', () => {
      const { container } = render(<HeroBanner {...defaultProps} height="medium" />)
      const section = container.querySelector('section')
      expect(section).toHaveClass('h-[400px]')
    })

    it('applies large height class (default)', () => {
      const { container } = render(<HeroBanner {...defaultProps} height="large" />)
      const section = container.querySelector('section')
      expect(section).toHaveClass('h-[500px]')
    })

    it('applies full height class', () => {
      const { container } = render(<HeroBanner {...defaultProps} height="full" />)
      const section = container.querySelector('section')
      expect(section).toHaveClass('min-h-screen')
    })

    it('uses large as default height when not specified', () => {
      const { container } = render(<HeroBanner {...defaultProps} />)
      const section = container.querySelector('section')
      expect(section).toHaveClass('h-[500px]')
    })
  })

  describe('Text Alignment', () => {
    it('applies center text alignment (default)', () => {
      const { container } = render(<HeroBanner {...defaultProps} textAlign="center" />)
      const contentDiv = container.querySelector('.flex.flex-col')
      expect(contentDiv).toHaveClass('text-center')
      expect(contentDiv).toHaveClass('items-center')
    })

    it('applies left text alignment', () => {
      const { container } = render(<HeroBanner {...defaultProps} textAlign="left" />)
      const contentDiv = container.querySelector('.flex.flex-col')
      expect(contentDiv).toHaveClass('text-left')
      expect(contentDiv).toHaveClass('items-start')
    })

    it('applies right text alignment', () => {
      const { container } = render(<HeroBanner {...defaultProps} textAlign="right" />)
      const contentDiv = container.querySelector('.flex.flex-col')
      expect(contentDiv).toHaveClass('text-right')
      expect(contentDiv).toHaveClass('items-end')
    })
  })

  describe('Text Position', () => {
    it('applies center vertical position (default)', () => {
      const { container } = render(<HeroBanner {...defaultProps} textPosition="center" />)
      const contentDiv = container.querySelector('.flex.flex-col')
      expect(contentDiv).toHaveClass('justify-center')
    })

    it('applies top vertical position', () => {
      const { container } = render(<HeroBanner {...defaultProps} textPosition="top" />)
      const contentDiv = container.querySelector('.flex.flex-col')
      expect(contentDiv).toHaveClass('justify-start')
      expect(contentDiv).toHaveClass('pt-20')
    })

    it('applies bottom vertical position', () => {
      const { container } = render(<HeroBanner {...defaultProps} textPosition="bottom" />)
      const contentDiv = container.querySelector('.flex.flex-col')
      expect(contentDiv).toHaveClass('justify-end')
      expect(contentDiv).toHaveClass('pb-20')
    })
  })

  describe('Overlay Options', () => {
    it('applies gradient overlay (default)', () => {
      const { container } = render(<HeroBanner {...defaultProps} overlay="gradient" />)
      const overlay = container.querySelector('.bg-gradient-to-b')
      expect(overlay).toBeInTheDocument()
    })

    it('applies light overlay', () => {
      const { container } = render(<HeroBanner {...defaultProps} overlay="light" />)
      const overlay = container.querySelector('.bg-white\\/60')
      expect(overlay).toBeInTheDocument()
    })

    it('applies dark overlay', () => {
      const { container } = render(<HeroBanner {...defaultProps} overlay="dark" />)
      const overlay = container.querySelector('.bg-black\\/60')
      expect(overlay).toBeInTheDocument()
    })

    it('does not render overlay when set to none', () => {
      const { container } = render(<HeroBanner {...defaultProps} overlay="none" />)
      const imageWrapper = container.querySelector('.absolute.inset-0.z-0')
      // Should only have the Image component, no overlay div
      expect(imageWrapper?.children).toHaveLength(1)
    })
  })

  describe('Image', () => {
    it('renders Next.js Image with correct props', () => {
      const { container } = render(<HeroBanner {...defaultProps} />)
      const img = container.querySelector('img')
      expect(img).toHaveAttribute('alt', 'Test image')
      // Next.js Image component sets data-nimg attribute
      expect(img?.getAttribute('data-nimg')).toBeDefined()
    })

    it('sets priority loading on image', () => {
      const { container } = render(<HeroBanner {...defaultProps} />)
      const img = container.querySelector('img')
      // Next.js Image with priority prop will have fetchpriority="high"
      expect(img?.getAttribute('fetchpriority')).toBe('high')
    })
  })

  describe('Custom className', () => {
    it('applies custom className to section', () => {
      const { container } = render(
        <HeroBanner {...defaultProps} className="custom-class" />
      )
      const section = container.querySelector('section')
      expect(section).toHaveClass('custom-class')
    })

    it('preserves default classes when custom className is added', () => {
      const { container } = render(
        <HeroBanner {...defaultProps} className="custom-class" />
      )
      const section = container.querySelector('section')
      expect(section).toHaveClass('relative')
      expect(section).toHaveClass('w-full')
      expect(section).toHaveClass('overflow-hidden')
      expect(section).toHaveClass('custom-class')
    })
  })

  describe('Brand Compliance', () => {
    it('uses Lora font for title', () => {
      render(<HeroBanner {...defaultProps} />)
      const title = screen.getByRole('heading', { name: 'Test Title' })
      expect(title).toHaveClass("font-['Lora']")
    })

    it('applies brand terracotta color #D98C4A to primary CTA', () => {
      render(
        <HeroBanner
          {...defaultProps}
          primaryCTA={{ text: 'Shop Now', href: '/products' }}
        />
      )
      const button = screen.getByRole('button', { name: 'Shop Now' })
      expect(button).toHaveClass('bg-[#D98C4A]')
      expect(button).toHaveClass('hover:bg-[#D98C4A]/90')
    })

    it('applies white text color throughout', () => {
      render(
        <HeroBanner
          {...defaultProps}
          subtitle="Subtitle"
          description="Description"
        />
      )
      const title = screen.getByRole('heading', { name: 'Test Title' })
      expect(title).toHaveClass('text-white')
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive text sizing to title', () => {
      render(<HeroBanner {...defaultProps} />)
      const title = screen.getByRole('heading', { name: 'Test Title' })
      expect(title).toHaveClass('text-4xl')
      expect(title).toHaveClass('md:text-5xl')
      expect(title).toHaveClass('lg:text-6xl')
      expect(title).toHaveClass('xl:text-7xl')
    })

    it('applies responsive height classes', () => {
      const { container } = render(<HeroBanner {...defaultProps} height="medium" />)
      const section = container.querySelector('section')
      expect(section).toHaveClass('h-[400px]')
      expect(section).toHaveClass('md:h-[500px]')
    })

    it('applies responsive padding classes', () => {
      const { container } = render(<HeroBanner {...defaultProps} />)
      const contentDiv = container.querySelector('.flex.flex-col')
      expect(contentDiv).toHaveClass('px-4')
      expect(contentDiv).toHaveClass('sm:px-6')
      expect(contentDiv).toHaveClass('lg:px-8')
    })
  })

  describe('Integration Tests', () => {
    it('renders complete hero banner with all options', () => {
      render(
        <HeroBanner
          title="Natural Wellness"
          subtitle="Welcome"
          description="Premium herbal tinctures"
          imageSrc="https://images.unsplash.com/photo-test"
          imageAlt="Herbs"
          primaryCTA={{ text: 'Shop', href: '/products' }}
          secondaryCTA={{ text: 'Learn', href: '/about' }}
          height="large"
          textAlign="center"
          textPosition="center"
          overlay="gradient"
          className="custom-hero"
        />
      )

      expect(screen.getByRole('heading', { name: 'Natural Wellness' })).toBeInTheDocument()
      expect(screen.getByText('Welcome')).toBeInTheDocument()
      expect(screen.getByText('Premium herbal tinctures')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Shop' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Learn' })).toBeInTheDocument()
    })

    it('renders minimal hero banner with only required props', () => {
      render(<HeroBanner {...defaultProps} />)

      expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument()
      const links = screen.queryAllByRole('link')
      expect(links).toHaveLength(0)
    })
  })
})
