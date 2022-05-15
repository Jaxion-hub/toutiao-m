<template>
  <div class="article-list">
    <!-- List 组件通过 loading 和 finished 两个变量控制加载状态，当组件滚动到底部时，会触发 load 事件并将 loading 设置成 true。此时可以发起异步操作并更新数据，数据更新完毕后，将 loading 设置成 false 即可。若数据已全部加载完毕，则直接将 finished 设置成 true 即可。 -->
    <van-pull-refresh
      v-model="isreFreshLoading"
      :success-text="refreshSuccessText"
      success-duration="1500"
      @refresh="onRefresh"
    >
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        :error.sync="error"
        error-text="请求失败，点击重新加载"
        @load="onLoad"
      >
        <article-item
          v-for="(article, index) in list"
          :key="index"
          :article="article"
        ></article-item>
        <!--  <van-cell
          v-for="(article, index) in list"
          :key="index"
          :title="article.title"
        /> -->
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import { getArticles } from "@/api/article";
import ArticleItem from "@/components/article-item";
export default {
  name: "ArticleList",
  components: {
    ArticleItem,
  },
  props: {
    channel: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      list: [], // 存储列表数据
      loading: false, // 控制器加载中 loading 状态
      finished: false, // 控制数据加载结束的状态
      timestamp: null, // 请求获取下一页数据的时间戳
      error: false,
      isreFreshLoading: false, // 控制下拉刷新的 loading 状态
      refreshSuccessText: "刷新成功", // 下拉成功提示文本
    };
  },
  methods: {
    async onLoad() {
      try {
        // 1.异步更新获取数据
        const { data } = await getArticles({
          channel_id: this.channel.id, // 频道ID
          // timestamp 简单理解就是请求数据的页码
          // 请求第1页数据：当前最新时间戳
          // 用于请求之后数据的时间戳会在当前请求结果中返回给你
          timestamp: this.timestamp || Date.now(),
        });

        // 模拟随机失败的情况
        /* if (Math.random() > 0.5) {
          JSON.parse("FASFA");
        } */

        // 2.把请求结果数据放到 list 数组中
        const { results } = data.data;
        this.list.push(...results);
        // console.log(results);

        // 3.加载状态结束 把加载状态设置为结束
        this.loading = false;

        // 4.数据全部加载完成
        if (results.length) {
          //更新获取下一页数据的时间戳
          this.timestamp = data.data.pre_timestamp;
        } else {
          // 没有数据了，将finished设置为true，不再load加载更多
          this.finished = true;
        }
      } catch (err) {
        // 展示错误提示状态
        this.error = true;
        // 请求失败了，loading也需要关闭
        this.loading = false;
      }
    },
    // 初始化或者滚动到底部的时候会触发调用 onload
    /* onLoad() {
      // 1.异步更新获取数据
      // setTimeout 仅做示例，真实场景中一般为 ajax 请求
      setTimeout(() => {
        // 2.把请求结果数据放到 list 数组中
        for (let i = 0; i < 10; i++) {
          this.list.push(this.list.length + 1);
        }

        // 3.加载状态结束 把加载状态设置为结束
        // loading 关闭以后才能触发下一次的加载更过
        this.loading = false;

        // 4.数据全部加载完成
        if (this.list.length >= 40) {
          this.finished = true;
        }
      }, 1000);
    }, */

    // 当下拉刷新的时候会触发调用该函数
    async onRefresh() {
      try {
        // 1.请求获取数据
        const { data } = await getArticles({
          channel_id: this.channel.id, // 频道ID
          // 下拉刷新，每次请求获取最新数据，所以传递当前最新时间戳
          timestamp: Date.now(),
        });

        // 模拟随机失败的情况
        /* if (Math.random() > 0.5) {
          JSON.parse("FASFA");
        } */

        // 2.将数据追加到列表的顶部
        const { results } = data.data;
        this.list.unshift(...results);

        // 3.关闭下拉刷新的 loading 状态
        this.isreFreshLoading = false;

        // 更新下拉刷新成功提示的文本
        this.refreshSuccessText = `刷新成功，更新了${results.length}条数据`;
      } catch (err) {
        this.isreFreshLoading = false;
        this.refreshSuccessText = "刷新失败";
      }
    },
  },
};
</script>

<style scoped lang="less">
.article-list {
  height: 79vh;
  overflow-y: auto;
}
</style>
