<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" show-icon center> </el-alert>
      <!-- 步骤条区域 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab 栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          tab-position="left"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="addProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的 Item 项 -->
            <el-form-item :label="item.attr_name" v-for="item in myTableData" :key="item.attr_id">
              <!-- 多选框 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
                -->
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in oyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示图片要上传到的后台API地址 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" style="margin-top: 15px" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog
      :visible.sync="previewDialogVisible"
      title="图片预览"
      width="50%"
    >
    <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data() {
    return {
      activeIndex: 0,
      // 添加商品的表单数据对象
      addForm: {
        // 商品名称
        goods_name: "",
        // 商品价格
        goods_price: 0,
        // 商品重量
        goods_weight: 0,
        // 商品数量
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 富文本编辑器 商品的介绍
        goods_introduce: '',
        // 商品的参数
        attrs: []
      },
      // 添加商品的验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
      },
      // 商品分类列表
      cateList: [],
      addProps: {
        expandTrigger: "hover",
        label: "cat_name",
        value: "cat_id",
        children: "children",
      },
      // 获取到的商品参数数据
      myTableData: [],
      // 获取到的商品属性数据
      oyTableData: [],
      // 商品图片上传的路径
      uploadURL: "http://127.0.0.1:8888/api/private/v1/upload",
      // 图片上传的token
      headersObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      // 图片预览路径
      previewPath: [],
      // 处理图片预览弹出窗
      previewDialogVisible: false
    };
  },
  created() {
    this.getAddList();
  },
  methods: {
    async getAddList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取信息失败");
      }
      this.cateList = res.data;
      console.log(this.cateList);
    },
    // 级联选择器选中项发生变化，会触发这个函数
    handleChange() {
      console.log(this.addForm.goods_cat);
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    beforeTabLeave(activeName, oldActiveName) {
      console.log("即将离开标签页的名字是 " + oldActiveName);
      console.log("即将进入标签页的名字是 " + activeName);
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类");
        return false;
      }
    },
    async tabClicked() {
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.addId}/attributes`,
          {
            params: { sel: "many" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取参数失败");
        }
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        this.myTableData = res.data;
        console.log(this.myTableData);
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.addId}/attributes`,
          {
            params: { sel: "only" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取参数失败");
        }

        this.oyTableData = res.data;
        console.log(this.oyTableData);
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      // console.log(file);
      this.previewPath = file.response.data.url;
      this.previewDialogVisible = true
    },
    // 处理移除图片效果
    handleRemove(file) {
      // console.log(file);
      // 1.获取将要删除的图片临时路径
      const filePath = file.response.data.tmp_path;
      // 2.从 pics 数组中，找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex((x) => {
        x.pic === filePath;
      });
      // 3.调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
      this.addForm.pics.splice(i, 1);
      console.log(this.addForm);
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      console.log(response);
      // 1.拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path };
      // 2.将图片信息对象 push 到 pics 数组中
      this.addForm.pics.push(picInfo);
      console.log(this.addForm);
    },
    // 添加商品按钮
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if(!valid){
          return this.$message.error('请填写正确的表单项')
        }
        // 执行添加的业务逻辑
        const from = _.cloneDeep(this.addForm)
        from.goods_cat = from.goods_cat.join(',')

        // 处理动态参数
        this.myTableData.forEach(item => {
          const newInfo = {attr_id: item.attr_id, attr_value: item.attr_vals.join(' ')}
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.oyTableData.forEach(item => {
          const newInfo = {attr_id: item.attr_id, attr_value: item.attr_vals}
          this.addForm.attrs.push(newInfo)
        })

        from.attrs = this.addForm.attrs
        console.log(from)

        // 发起网络请求
        const {data: res} = await this.$http.post('goods', from)
        if(res.meta.status !== 201) {
          return this.$message.error('添加失败')
        }
        this.$message.success('添加成功')
        this.$router.push('/goods')
      })

    }
  },
  computed: {
    addId() {
      if (this.addForm.goods_cat.length === 3) {
        console.log(this.addForm.goods_cat);
        return this.addForm.goods_cat[2];
      }
      return null;
    },
  },
};
</script>

<style lang="less" scoped>
.el-steps {
  margin: 15px 0;
}
.el-checkbox {
  margin: 0 5px 0 0 !important;
}
.previewImg {
  width: 100%;
}
</style>
