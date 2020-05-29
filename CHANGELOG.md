# Changelog

## 1.2.0 - 2020-05-20

- Adding support for query parameters `page` and `pageSize`

## 1.2.1 - 2020-05-20

- Made run instructions clearer

## 1.3.1 - 2020-05-20

- Adding support for new resource creation `/<resource>/new`

## 1.3.2 - 2020-05-20

- Test added to ensure no new resource is created with `/<resource>/new` if resource already exist

## 1.3.3 - 2020-05-21

- Adding CORS, all requests are CORS enabled

## 1.4.4 - 2020-05-21

- Adding ESLint

## 1.5.0 - 2020-05-21

- Adding CI with Azure Devops

## 1.6.0 - 2020-05-21

- Added ability to sort.

## 1.7.0 - 2020-05-21

- Static file hosting, use `--static` to specify what directory, otherwise root is used.

## 1.8.0 - 2020-05-21

- Auto start browser at `http://localhost:<selected port>/info`.

## 1.9.0 - 2020-05-29

- Hot reload, you can now edit the db file and the server will restart by itself.
