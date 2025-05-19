rm -rf ./dist
mkdir -p dist
# 构建前端
npx vite build --emptyOutDir --outDir dist/
