import { orderBy } from 'lodash'

export function sortMenu(menuTree) {
  return orderBy(
    menuTree,
    [
      function(item) {
        if (item.children && item.children.length > 0) {
          item.children = sortChildren(item.children)
        }
        return item.meta.sorting
      },
    ],
    ['asc']
  )
}

function sortChildren(children) {
  return orderBy(
    children,
    [
      function(item) {
        if (item.children && item.children.length > 0) {
          sortChildren(item.children)
        }
        return item.meta.sorting
      },
    ],
    ['asc']
  )
}
