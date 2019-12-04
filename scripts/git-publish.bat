git checkout master
git merge development
git tag 2.4.0-rc1
git checkout development
git merge master
git push --all
git push --tags