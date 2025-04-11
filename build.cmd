@echo off

cd src

for %%f IN (*.mjml) do (
    call  ../node_modules/.bin/mjml %%f -o ../builds/%%f.html
)

cd ..
