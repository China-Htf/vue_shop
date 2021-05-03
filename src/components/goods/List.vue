<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" @clear="getGoodsList" clearable v-model="queryInfo.query">
            <el-button icon="el-icon-search" @click="getGoodsList" slot="append"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
    </el-card>
    <!-- table表格区域 -->
    <el-table :data="goodslist" border stripe>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="商品名称" prop="goods_name"></el-table-column>
      <el-table-column label="商品价格" width="95px" prop="goods_price"></el-table-column>
      <el-table-column label="商品重量"  width="70px" prop="goods_weight"></el-table-column>
      <el-table-column label="上传时间"   width="140px" prop="add_time">
        <template slot-scope="scope">
          {{scope.row.add_time | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="230px">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeById(scope.row.goods_id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[5, 10, 15, 20]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total" background>
    </el-pagination>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询参数列表
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      // 商品列表
      goodslist: [],
      // 总数据条数
      total: 0
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 根据分页获取对应的数据列表
    async getGoodsList() {
      const {data: res} = await this.$http.get('goods', {params: this.queryInfo})
      if(res.meta.status !== 200) {
        this.$message.error('获取信息列表失败')
      }
        this.goodslist = res.data.goods
        this.total = res.data.total
    },
    // 分页功能显示条数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 分页功能 修改页码值
    handleCurrentChange(newPage){
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 删除功能
    async removeById(id) {
      const {data: res} = await this.$http.delete('goods/' + id)
      if(res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getGoodsList()

    },
    // 添加商品
    goAddPage() {
      this.$router.push('/goods/add')
    }
  }
};
</script>

<style lang="less" scoped>
</style>
