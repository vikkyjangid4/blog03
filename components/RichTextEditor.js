import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import axios from 'axios'
import 'react-quill/dist/quill.snow.css'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-100 h-64 rounded-lg"></div>
})

const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Write your blog content here...",
  className = ""
}) => {
  const quillRef = useRef(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Custom image upload handler
  const imageHandler = async () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = async () => {
      const file = input.files[0]
      if (!file) return

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }

      try {
        // Show loading state
        const quill = quillRef.current?.getEditor()
        if (!quill) return

        const range = quill.getSelection(true)
        quill.insertEmbed(range.index, 'text', 'Uploading image...')
        quill.setSelection(range.index + 1)

        // Upload image to backend
        const formData = new FormData()
        formData.append('image', file)

        const response = await axios.post('/api/upload/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        // Remove loading text
        quill.deleteText(range.index, 'Uploading image...'.length)
        
        // Insert uploaded image
        const imageUrl = response.data.url
        quill.insertEmbed(range.index, 'image', imageUrl)
        quill.setSelection(range.index + 1)

      } catch (error) {
        console.error('Image upload failed:', error)
        alert('Failed to upload image. Please try again.')
        
        // Remove loading text on error
        const quill = quillRef.current?.getEditor()
        if (quill) {
          const range = quill.getSelection(true)
          quill.deleteText(range.index, 'Uploading image...'.length)
        }
      }
    }
  }

  // Quill toolbar configuration
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }

  // Quill formats
  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link', 'image'
  ]

  if (!isClient) {
    return <div className="animate-pulse bg-gray-100 h-64 rounded-lg"></div>
  }

  return (
    <div className={`rich-text-editor ${className}`}>
      <style jsx global>{`
        .rich-text-editor .quill {
          background: white;
          border-radius: 0.5rem;
          border: 1px solid #d1d5db;
        }

        .rich-text-editor .ql-toolbar {
          border: none;
          border-bottom: 1px solid #d1d5db;
          border-radius: 0.5rem 0.5rem 0 0;
          background: #f9fafb;
          padding: 0.75rem;
        }

        .rich-text-editor .ql-container {
          border: none;
          font-size: 16px;
          font-family: inherit;
          min-height: 300px;
        }

        .rich-text-editor .ql-editor {
          padding: 1rem;
          min-height: 300px;
        }

        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }

        .rich-text-editor .ql-toolbar button {
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.375rem;
          transition: all 0.15s ease;
        }

        .rich-text-editor .ql-toolbar button:hover {
          background: #e5e7eb;
        }

        .rich-text-editor .ql-toolbar button.ql-active {
          background: #fed7aa;
          color: #ea580c;
        }

        .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: #4b5563;
        }

        .rich-text-editor .ql-toolbar .ql-fill {
          fill: #4b5563;
        }

        .rich-text-editor .ql-toolbar button:hover .ql-stroke {
          stroke: #1f2937;
        }

        .rich-text-editor .ql-toolbar button:hover .ql-fill {
          fill: #1f2937;
        }

        .rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: #ea580c;
        }

        .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
          fill: #ea580c;
        }

        .rich-text-editor .ql-editor h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }

        .rich-text-editor .ql-editor h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
        }

        .rich-text-editor .ql-editor h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
        }

        .rich-text-editor .ql-editor h4 {
          font-size: 1em;
          font-weight: bold;
          margin: 1em 0;
        }

        .rich-text-editor .ql-editor ul,
        .rich-text-editor .ql-editor ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }

        .rich-text-editor .ql-editor li {
          margin: 0.25em 0;
        }

        .rich-text-editor .ql-editor a {
          color: #ea580c;
          text-decoration: underline;
        }

        .rich-text-editor .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }

        .rich-text-editor .ql-snow .ql-picker {
          font-size: 14px;
          height: 32px;
          line-height: 32px;
        }

        .rich-text-editor .ql-snow .ql-picker-label {
          padding: 0 8px;
          border-radius: 0.375rem;
        }

        .rich-text-editor .ql-snow .ql-picker-label:hover {
          background: #e5e7eb;
        }

        .rich-text-editor .ql-snow .ql-picker-options {
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        /* Focus state */
        .rich-text-editor .quill:focus-within {
          border-color: #ea580c;
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.1);
        }

        /* Responsive */
        @media (max-width: 640px) {
          .rich-text-editor .ql-toolbar {
            padding: 0.5rem;
          }

          .rich-text-editor .ql-toolbar button {
            width: 28px;
            height: 28px;
          }

          .rich-text-editor .ql-container {
            font-size: 14px;
          }

          .rich-text-editor .ql-editor {
            padding: 0.75rem;
            min-height: 250px;
          }
        }
      `}</style>
      
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  )
}

export default RichTextEditor
