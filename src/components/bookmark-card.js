import { useToggle } from 'react-use'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { asyncFileReader } from '@/lib/helpers'
import { useStore } from '@/lib/store'
import { useToast, toastTypes } from '@/lib/hooks'

export default function BookmarkCard({ bookmark, categories }) {
  const removeBookmark = useStore((state) => state.removeBookmark)
  const [on, toggle] = useToggle(false)
  const { data: session } = useSession()
  const { id, title, url, description, category, tags, createdAt, image } =
    bookmark

  const [imageUrl, setImageUrl] = useState(
    image || 'https://source.unsplash.com/random/300x201'
  )
  const toast = useToast(5000)

  async function handleDelete() {
    try {
      await fetch('/api/bookmarks', {
        method: 'DELETE',
        body: JSON.stringify({
          id,
          userId: session.user.userId,
        }),
      })
      removeBookmark({ id })
      toast(toastTypes.SUCCESS, `Successfully deleted ${new URL(url).hostname}`)
    } catch (error) {
      console.error(error)
      toast(toastTypes.ERROR, 'Error deleting bookmark', error.message)
    }
  }

  async function fetchFallbackImage(url) {
    try {
      const res = await fetch(
        `/api/bookmarks/image?url=${encodeURIComponent(url)}`
      )
      const data = await res.blob()
      const dataUrl = await asyncFileReader(data)
      const uploadRes = await fetch(
        `/api/bookmarks/uploadImage?fileName=${new URL(url).hostname}&id=${id}`,
        {
          method: 'PUT',
          body: dataUrl,
        }
      )
      const uploadData = await uploadRes.json()
      setImageUrl(uploadData.url)
    } catch (error) {
      console.error(error)
      toast(toastTypes.ERROR, 'Error fetching fallback image', error.message)
      setImageUrl('https://source.unsplash.com/random/300x201')
    }
  }

  return (
    <>
      <div className="group relative mb-12 flex cursor-pointer flex-col overflow-hidden">
        <button
          onClick={() => toggle()}
          name="edit"
          className="absolute top-3 right-3 z-10 text-slate-500 opacity-0 outline-none transition hover:text-slate-800 hover:outline-none focus:text-slate-800 group-hover:opacity-100"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
        {on && (
          <button
            name="delete"
            onClick={handleDelete}
            className="absolute top-10 right-3 z-10 text-rose-300 opacity-0 outline-none transition animate-in slide-in-from-top hover:text-rose-800 hover:outline-none group-hover:opacity-100"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
        <div className="flex-shrink-0">
          <a href={url} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable @next/next/no-img-element */}
            <img
              className="aspect-6 h-48 rounded-lg object-contain "
              src={imageUrl}
              onError={() => fetchFallbackImage(url)}
              alt={`${url} Image`}
            />
          </a>
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <a href={url}></a>
          <div className="flex-1">
            <a href={url}>
              <div className="flex space-x-1 pt-6 text-sm text-gray-500">
                <time dateTime="2020-03-10">
                  {new Date(createdAt).toLocaleDateString('de')}
                </time>
                <span aria-hidden="true"> · </span>
                {category?.name && <span>{category?.name}</span>}
              </div>
            </a>
            <a href={url} className="mt-2 block space-y-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tighter text-neutral-600 line-clamp-1">
                {title}
              </h3>
              {description && (
                <p className="text-lg font-normal text-gray-500 line-clamp-3">
                  {description}
                </p>
              )}
              {tags?.length > 0 && (
                <div className="px-6 pt-2 pb-2">
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="mb-2 mr-2 inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
