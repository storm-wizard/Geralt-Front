import http from '@/utils/httpRequest.js'

export function policy(file_path, method) {
  return new Promise((resolve, reject) => {
    console.log("enter policy" , file_path);
    http({
      url: http.adornUrl("/thirdparty/s3/" + method),
      method: "get",
      params: http.adornParams({'objectKey': file_path})
    }).then(({data}) => {
      resolve(data);
    })
  });
}
