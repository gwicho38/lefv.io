import fs from "fs";
import path from "path";
import { loadAllPosts } from "../lib/posts";

const OUT = path.join(process.cwd(), "worker/posts.generated.json");

const posts = await loadAllPosts({ includeDrafts: true });
fs.writeFileSync(OUT, JSON.stringify(posts, null, 2));
console.log(`baked ${posts.length} posts -> ${path.relative(process.cwd(), OUT)}`);
