"use client";

const CLOUDINARY = /^https:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\//;
const TRANSFORM_SEGMENT = /^[a-z]{1,3}_[^/,]+(,[a-z]{1,3}_[^/,]+)*$/;

function stripTransform(path) {
  const slash = path.indexOf("/");
  if (slash <= 0) return path;
  const first = path.slice(0, slash);
  return TRANSFORM_SEGMENT.test(first) ? path.slice(slash + 1) : path;
}

export default function imageLoader({ src, width, quality }) {
  const q = quality || "auto";

  const cloudinary = src.match(CLOUDINARY);
  if (cloudinary) {
    const cloud = cloudinary[1];
    const rest = stripTransform(src.slice(cloudinary[0].length));
    return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_${q},c_limit,w_${width}/${rest}`;
  }

  return src;
}
