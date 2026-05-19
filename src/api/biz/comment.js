import request from '@/utils/request'

// 查询评价列表
export function listComment(query) {
  return request({
    url: '/api/comment/list',
    method: 'get',
    params: query
  })
}

// 查询评价详细
export function getComment(id) {
  return request({
    url: '/api/comment/' + id,
    method: 'get'
  })
}

// 添加评价
export function addComment(data) {
  return request({
    url: '/api/comment',
    method: 'post',
    data: data
  })
}

// 回复评价
export function replyComment(id, replyContent) {
  return request({
    url: '/api/comment/' + id + '/reply',
    method: 'put',
    params: { replyContent }
  })
}
