git checkout master
git merge development
git tag 2.3.0-rc3
git checkout development
git merge master
git push --all
git push --tags