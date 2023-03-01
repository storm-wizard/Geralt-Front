<template>
  <el-dialog
    :title="!dataForm.attrGroupId ? 'Add' : 'Update'"
    :close-on-click-modal="false"
    :visible.sync="visible"
    @closed="dialogClose"
  >
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()"
             label-width="80px">
      <el-form-item label="attr_group_name" prop="attrGroupName">
        <el-input v-model="dataForm.attrGroupName" placeholder=""></el-input>
      </el-form-item>
      <el-form-item label="sort" prop="sort">
        <el-input v-model="dataForm.sort" placeholder=""></el-input>
      </el-form-item>
      <el-form-item label="description" prop="description">
        <el-input v-model="dataForm.description" placeholder=""></el-input>
      </el-form-item>
      <el-form-item label="icon" prop="icon">
        <el-input v-model="dataForm.icon" placeholder=""></el-input>
      </el-form-item>
      <el-form-item label="catelog_id" prop="catelogId">
        <!--<el-input v-model="dataForm.catelogId" placeholder=""></el-input>-->
        <el-cascader
          v-model="dataForm.catelogPath"
          :options="categories"
          :props="props"
          filterable
        placeholder="please try to type for search"></el-cascader>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" @click="dataFormSubmit()">Confirm</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      props: {
        value: "catId",
        label: "name",
        children: "children",
      },
      categories: [],
      visible: false,
      dataForm: {
        attrGroupId: 0,
        attrGroupName: '',
        sort: '',
        description: '',
        icon: '',
        catelogPath: [],
        catelogId: 0,
      },
      dataRule: {
        attrGroupName: [
          {required: true, message: ' cannot be null', trigger: 'blur'}
        ],
        sort: [
          {required: true, message: ' cannot be null', trigger: 'blur'}
        ],
        description: [
          {required: true, message: ' cannot be null', trigger: 'blur'}
        ],
        icon: [
          {required: true, message: ' cannot be null', trigger: 'blur'}
        ],
        catelogId: [
          {required: true, message: ' cannot be null', trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    dialogClose() {
      this.dataForm.catelogPath = [];
    },
    getCategories() {
      this.dataListLoading = true
      this.$http({
        url: this.$http.adornUrl('/product/category/list/tree'),
        method: 'get'
      }).then(({data}) => {
        console.log('Get menus successfully...', data.data)
        this.categories = data.data;
      })
    },
    init(id) {
      this.dataForm.attrGroupId = id || 0
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.attrGroupId) {
          this.$http({
            url: this.$http.adornUrl(`/product/attrgroup/info/${this.dataForm.attrGroupId}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.dataForm.attrGroupName = data.attrGroup.attrGroupName
              this.dataForm.sort = data.attrGroup.sort
              this.dataForm.description = data.attrGroup.description
              this.dataForm.icon = data.attrGroup.icon
              this.dataForm.catelogId = data.attrGroup.catelogId
              // query catelogid full path
              this.dataForm.catelogPath = data.attrGroup.catelogPath
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
            url: this.$http.adornUrl(`/product/attrgroup/${!this.dataForm.attrGroupId ? 'save' : 'update'}`),
            method: 'post',
            data: this.$http.adornData({
              'attrGroupId': this.dataForm.attrGroupId || undefined,
              'attrGroupName': this.dataForm.attrGroupName,
              'sort': this.dataForm.sort,
              'description': this.dataForm.description,
              'icon': this.dataForm.icon,
              'catelogId': this.dataForm.catelogPath[this.dataForm.catelogPath.length - 1]
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
  },
  created() {
    this.getCategories();
  }
}
</script>
