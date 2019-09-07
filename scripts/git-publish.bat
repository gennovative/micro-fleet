git add -A
git commit -m "Sync version with other packages; Published 2.3.0-rc1;"
git checkout master
git merge development
git tag 2.3.0-rc1
git checkout development
git merge master
git push --all
git push --tags