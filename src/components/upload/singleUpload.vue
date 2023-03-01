<template>
  <div>
    <el-upload
      :action="signedUrl"
      list-type="picture"
      :multiple="false" :show-file-list="showFileList"
      :file-list="fileList"
      :before-upload="beforeUpload"
      :http-request="uploadToS3">
      <el-button size="small" type="primary">点击上传</el-button>
      <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过10MB</div>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="fileList[0].url" alt="">
    </el-dialog>
  </div>
</template>
<script>
import {policy} from './policy'
import {getUUID} from '@/utils'
import {data} from "autoprefixer";
import axios from "axios";

export default {
  name: 'singleUpload',
  props: {
    value: String
  },
  computed: {
    imageUrl() {
      return this.value;
    },
    imageName() {
      if (this.value != null && this.value !== '') {
        return this.value.substr(this.value.lastIndexOf("/") + 1);
      } else {
        return null;
      }
    },
    fileList() {
      return [{
        name: this.imageName,
        url: this.imageUrl
      }]
    },
    showFileList: {
      get: function () {
        return this.value !== null && this.value !== '' && this.value !== undefined;
      },
      set: function (newValue) {
      }
    }
  },
  data() {
    return {
      dialogVisible: false,
      signedUrl: "",
      displayUrl: "",
      fileFullPath: "",
    };
  },
  methods: {
    uploadToS3(file) {
      console.log("enter s3 ----", file.file.name)
      console.log("print something: " + this.fileFullPath)
      let config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      axios.put(this.signedUrl, file.file, config)
        .then(res => {
          console.log("upload succeed", this.fileFullPath);

          this.beforeFetch().then((data) => {
            console.log("get display url succeed", data.data.url)
            this.showFileList = true;
            this.fileList.pop();
            this.fileList.push({name: file.file.name, url: data.data.url});
            console.log("hjhhh", data.data.url);
            this.emitInput(this.fileList[0].url);
          });

          // this.$http({
          //   url: this.$http.adornUrl('/thirdparty/s3/fetch/'),
          //   method: 'get',
          //   param: this.$http.adornParams({"objectKey": this.fileFullPath})
          // }).then(({data}) => {
          //   console.log("get display url succeed", data.data.url)
          //   //   this.showFileList = true;
          //   //   this.fileList.pop();
          //   //   this.fileList.push({name: file.file.name, url: data.data.url});
          //   //   this.emitInput(this.fileList[0].url);
          // })
          // this.dialogVisible = true;
        }).catch(
        err => {
          console.log(err)
        }
      )
    },
    beforeUpload(file) {
      console.log("before upload", file)
      let _self = this;
      return new Promise((resolve, reject) => {
        policy(file.name, "upload").then(response => {
          _self.signedUrl = response.data.url;
          _self.fileFullPath = response.data.dir;
          resolve(true)
        }).catch(err => {
          reject(false)
        })
      })
    },
    beforeFetch() {
      console.log("before upload")
      let _self = this;
      return new Promise((resolve, reject) => {
        policy(this.fileFullPath, "fetch").then(response => {
          resolve(response)
        }).catch(err => {
          reject(false)
        })
      })
    },
    emitInput(val) {
      this.$emit('input', val)
    },
  }
}
</script>
<style>

</style>


