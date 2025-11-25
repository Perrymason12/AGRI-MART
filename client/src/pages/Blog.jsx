import React from 'react'
import { Link } from 'react-router-dom'
import { blogs } from '../assets/data'

const slugify = (s) =>
  s
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

const Blog = () => {
  return (
    <div className='max-padd-container py-16 pt-28 bg-primary'>
      <h2 className='h4 mb-6'>Blog</h2>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {blogs.map((b, i) => (
          <article key={i} className='bg-white p-4 rounded-lg hover:shadow-lg transition-shadow duration-200'>
            <img src={b.image} alt={b.title} className='w-full h-40 object-cover rounded-md mb-3' />
            <div className='mb-2'>
              <span className='inline-block px-2 py-1 bg-secondary/10 text-secondary rounded text-xs font-semibold'>
                {b.category}
              </span>
            </div>
            <h3 className='h5 mb-2'>{b.title}</h3>
            <p className='text-sm text-gray-600 line-clamp-2 mb-3'>{b.description}</p>
            <div className='flex items-center justify-between text-xs text-gray-500 mb-3'>
              {b.author && <span>By {b.author}</span>}
              {b.readTime && <span>{b.readTime}</span>}
            </div>
            <Link to={`/blog/${slugify(b.title)}`} className='text-secondary hover:text-secondary-dark font-semibold mt-2 inline-block'>
              Read more →
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}

export default Blog
