import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { blogs } from '../assets/data'

const slugify = (s) =>
  s
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

const BlogDetail = () => {
  const { slug } = useParams()
  const blog = blogs.find((b) => slugify(b.title) === slug)

  if (!blog) {
    return (
      <div className='max-padd-container py-16 pt-28 bg-primary'>
        <p>Blog not found. <Link to="/blog" className='text-secondary'>Back to blog list</Link></p>
      </div>
    )
  }

  return (
    <div className='max-padd-container py-16 pt-28 bg-primary'>
      <div className='bg-white p-6 md:p-8 rounded-lg max-w-4xl mx-auto'>
        {/* Header */}
        <div className='mb-6'>
          <span className='inline-block px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-semibold mb-3'>
            {blog.category}
          </span>
          <h1 className='h2 md:h1 mb-4'>{blog.title}</h1>
          <div className='flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4'>
            {blog.author && (
              <div className='flex items-center gap-2'>
                <span className='font-semibold'>By {blog.author}</span>
              </div>
            )}
            {blog.date && (
              <div className='flex items-center gap-2'>
                <span>{blog.date}</span>
              </div>
            )}
            {blog.readTime && (
              <div className='flex items-center gap-2'>
                <span>•</span>
                <span>{blog.readTime}</span>
              </div>
            )}
          </div>
        </div>

        {/* Featured Image */}
        <img src={blog.image} alt={blog.title} className='w-full h-64 md:h-96 object-cover rounded-lg mb-6' />

        {/* Description */}
        <p className='text-lg text-gray-700 mb-6 font-medium'>{blog.description}</p>

        {/* Full Content */}
        {blog.content && (
          <div 
            className='prose prose-lg max-w-none mb-6'
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        )}

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className='mt-8 pt-6 border-t border-gray-200'>
            <h3 className='text-sm font-semibold text-gray-700 mb-3'>Tags:</h3>
            <div className='flex flex-wrap gap-2'>
              {blog.tags.map((tag, index) => (
                <span 
                  key={index}
                  className='px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm'
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className='mt-8 pt-6 border-t border-gray-200 flex justify-between items-center'>
          <Link to="/blog" className='text-secondary hover:text-secondary-dark font-semibold flex items-center gap-2'>
            ← Back to blog list
          </Link>
        </div>
      </div>
    </div>
  )
}

export default BlogDetail
