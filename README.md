# gql-loader

GQL loader allows you to load graphql queries from `.graphql` into your JS. It also has special syntax to allow importing of other files such as fragments.

## Install

```
npm install -S gql-loader
```

or

```
yarn add gql-loader
```

## Config

Add Loader to webpack config

```js
{
  test: /\.(graphql|gql)$/,
  exclude: /node_modules/,
  use: {
    loader: 'gql-loader',
    options: {
      baseDir: path.resolve(`${__dirname}/../src/graphql`)
    }
  }
}
```

#### Options

| Name | Default | Description |
| ---- | ------- | ----------- |
| baseDir | \<Project Dir\>/src/graphql | The base directory to look for graphql files if using special keywords. |

We only use `baseDir` if you use a shortcut keyword such as `fragments/`, `queries/`, or `mutations/`. If your import / require starts with one of those then we use the baseDir to build absolute path.

## How to use

Just require your graphql query file path. `require('queries/myQuery.graphql')`.

```
#import "fragments/myFragment.graphql"
#import "../fragments/myOtherFragment.graphql"

query MyQuery($myVar: String) {
  test(myVar: $myVar)
      ...myFragment
      ...myOtherFragment
    }
  }
}
```

As you can see there is special `#import` syntax at the top of the file. By using `#import "my/fragment/path.graphl` it will load the file and embed in place of the import statement. You can use relative path from this file, or use one of the special absolute path keywords.