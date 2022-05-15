<template>
  <!-- 评论列表 -->
  <van-list
    v-model="loading"
    :finished="finished"
    finished-text="已显示全部评论"
    :error="error"
    error-text="请求失败，点击重新加载"
    :immediate-check="false"
    @load="onLoad"
  >
    <comment-item
      v-for="(item, index) in list"
      :key="index"
      :comment="item"
      @reply-click="$emit('reply-click', $event)"
    >
    </comment-item>
  </van-list>
  <!-- 评论列表 -->
</template>

<script>
import { getComments } from "@/api/comment";
import CommentItem from "./comment-item";

export default {
  name: "CommentList",
  components: {
    CommentItem,
  },
  props: {
    source: {
      type: [Number, String, Object],
      required: true,
    },
    list: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      // 自定义 Prop 数据验证
      validator(value) {
        return ["a", "c"].includes(value);
      },
      default: "a",
    },
  },
  data() {
    return {
      // list: [], // 评论列表
      loading: false, // 上拉加载更多的 loading
      finished: false, // 是否加载结束
      offset: null, // 获取下一页数据的标记
      limit: 10,
      error: false,
    };
  },
  created() {
    // 当你手动初始 onLoad 的话，它不会自动开始初始的 loading
    this.loading = true;
    this.onLoad();
  },
  methods: {
    async onLoad() {
      try {
        // 1.请求获取数据
        const { data } = await getComments({
          type: this.type, // 评论类型，a-对文章(article)的评论，c-对评论(comment)的回复
          source: this.source, // 源id，文章id或评论id
          offset: this.offset, // 获取评论数据的偏移量，值为评论id，表示从此id的数据向后取，不传表示从第一页开始读取数据
          limit: this.limit, // 获取的评论数据个数，不传表示采用后端服务设定的默认每页数据量
        });
        // console.log(data);
        // 模拟随机失败的情况
        /* if (Math.random() > 0.5) {
          JSON.parse("FASFA");
        } */

        // 2.将数据添加到列表中
        const { results } = data.data;
        this.list.push(...results);
        // console.log(this.list);

        // 把文章评论的总数量传递到外部
        this.$emit("onload-success", data.data);

        // 3.将 loading 设置为 false
        this.loading = false;

        // 4.判断是否还有数据
        if (results.length) {
          //  有就更新获取下一项的数据页码
          this.offset = data.data.last_id;
        } else {
          //  没有就将 finished 设置结束
          this.finished = true;
        }
      } catch (err) {
        // this.$toast("请求出错，请重试！");
        this.error = true;
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped lang="less"></style>
