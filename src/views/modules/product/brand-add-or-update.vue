<template>
  <el-dialog
    :title="!dataForm.brandId ? 'Add' : 'Update'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()"
             label-width="120px">
      <el-form-item label="name" prop="name">
        <el-input v-model="dataForm.name" placeholder="brand name"></el-input>
      </el-form-item>
      <el-form-item label="logo" prop="logo">
        <!--        <el-input v-model="dataForm.logo" placeholder="logo url"></el-input>-->
        <single-upload v-model="dataForm.logo"></single-upload>
      </el-form-item>
      <el-form-item label="description" prop="description">
        <el-input v-model="dataForm.description" placeholder="description"></el-input>
      </el-form-item>
      <el-form-item label="show_status" prop="showStatus">
        <el-switch
          v-model="dataForm.showStatus"
          active-color="#13ce66"
          inactive-color="#ff4949"
          :active-value="1"
          :inactive-value="0">
        </el-switch>
        <!--      <el-input v-model="dataForm.showStatus" placeholder="0: invisible, 1:visible"></el-input>-->
      </el-form-item>
      <el-form-item label="first_letter" prop="firstLetter">
        <el-input v-model="dataForm.firstLetter" placeholder=""></el-input>
      </el-form-item>
      <el-form-item label="sort" prop="sort">
        <el-input v-model.number="dataForm.sort" placeholder=""></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" @click="dataFormSubmit()">Confirm</el-button>
    </span>
  </el-dialog>
</template>

<script>
import SingleUpload from "../../../components/upload/singleUpload.vue";
export default {
  components: {SingleUpload},
  data() {
    return {
      visible: false,
      dataForm: {
        brandId: 0,
        name: '',
        logo: '',
        description: '',
        showStatus: 1,
        firstLetter: '',
        sort: 0,
      },
      dataRule: {
        name: [
          {required: true, message: 'brand name cannot be null', trigger: 'blur'}
        ],
        logo: [
          {required: true, message: 'logo url cannot be null', trigger: 'blur'}
        ],
        description: [
          {required: true, message: 'description cannot be null', trigger: 'blur'}
        ],
        showStatus: [
          {required: true, message: '0: invisible, 1:visible cannot be null', trigger: 'blur'}
        ],
        firstLetter: [
          {
            validator: (rule, value, callback) => {
              if (value == '') {
                callback(new Error('First letter cannot be null'));
              } else if (!/^[a-zA-Z]$/.test(value)) {
                callback(new Error('First letter must be in alphabet'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        sort: [
          {
            validator: (rule, value, callback) => {
             if (!Number.isInteger(value) || value < 0) {
                callback(new Error('Sort must be an integer and greater than or equal to 0'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    init(id) {
      this.dataForm.brandId = id || 0
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.brandId) {
          this.$http({
            url: this.$http.adornUrl(`/product/brand/info/${this.dataForm.brandId}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.dataForm.name = data.brand.name
              this.dataForm.logo = data.brand.logo
              this.dataForm.description = data.brand.description
              this.dataForm.showStatus = data.brand.showStatus
              this.dataForm.firstLetter = data.brand.firstLetter
              this.dataForm.sort = data.brand.sort
            }
          })
        }
      })
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl(`/product/brand/${!this.dataForm.brandId ? 'save' : 'update'}`),
            method: 'post',
            data: this.$http.adornData({
              'brandId': this.dataForm.brandId || undefined,
              'name': this.dataForm.name,
              'logo': this.dataForm.logo,
              'description': this.dataForm.description,
              'showStatus': this.dataForm.showStatus,
              'firstLetter': this.dataForm.firstLetter,
              'sort': this.dataForm.sort
            })
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.$message({
                message: 'Operation Succeeded',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.visible = false
                  this.$emit('refreshDataList')
                }
              })
            } else {
              this.$message.error(data.msg)
            }
          })
        }
      })
    }
  }
}
</script>
