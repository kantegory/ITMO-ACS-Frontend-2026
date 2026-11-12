# Learn Git Branching

## intro1

```sh
git commit
git commit
```

## intro2

```sh
git branch bugFix
git checkout bugFix
```

## intro3

```sh
git checkout -b bugFix
git commit
git checkout main
git commit
git merge bugFix
```

## intro4

```sh
git checkout -b bugFix
git commit
git checkout main
git commit
git checkout bugFix
git rebase main
```

## remote1

```sh
git clone
```

## remote2

```sh
git commit
git checkout o/main
git commit
```

## remote3

```sh
git fetch
```

## remote4

```sh
git pull
```

## remote5

```sh
git clone
git fakeTeamwork 2
git commit
git pull
```

## remote6

```sh
git commit
git commit
git push
```

## remote7

```sh
git clone
git fakeTeamwork
git commit
git pull --rebase
git push
```

## remote8

```sh
git checkout -b feature
git push origin feature
git branch -f main o/main
```

## remoteAdvanced1

```sh
git fetch
git rebase o/main side1
git rebase side1 side2
git rebase side2 side3
git checkout main
git merge side3
git push
```

## remoteAdvanced2

```sh
git checkout main
git pull
git merge side1
git merge side2
git merge side3
git push
```

## remoteAdvanced3

```sh
git checkout -b side o/main
git commit
git pull --rebase
git push
```

## remoteAdvanced4

```sh
git push origin main
git push origin foo
```

## remoteAdvanced5

```sh
git push origin foo:main
git push origin main~1:foo
```

## remoteAdvanced6

```sh
git fetch origin C3:foo
git fetch origin C6:main
git checkout foo
git merge main
```

## remoteAdvanced7

```sh
git push origin :foo
git fetch origin :bar
```

## remoteAdvanced8

```sh
git pull origin C3:foo
git pull origin C2:side
```
