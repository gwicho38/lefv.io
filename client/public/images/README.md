Images referenced from blog posts live here.

A file at `client/public/images/foo.png` is served at `/images/foo.png`, so a
post references it as:

    ![Alt text describing the image](/images/foo.png)

Vite copies this directory to the build output as-is; the Worker serves it from
the assets binding, where static assets are free and uncapped.

Keep filenames lowercase and hyphenated, and prefix them with the post slug when
an image belongs to one post: `pr-view-diff-panel.webp`.

Screenshots come off a retina display far larger than they will ever render. The
reading column is 544px wide, so resize to 1400px and convert to WebP before
committing — that took this post's seven screenshots from 3.0MB to 396KB:

    sips -Z 1400 shot.png --out resized.png
    cwebp -q 82 resized.png -o shot.webp
