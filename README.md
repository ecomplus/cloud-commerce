# Open Headless Commerce

API-first, event driven, microservices based and cloud native headless commerce platform.

## Concepts

1. Truly flexible, modular and extensible;
2. Quick and cheap (as possible) serverless setup;
3. Horizontal autoscale with high availability and performance by default;
4. Modern tech stack and dev experience;
5. Easy third-party integrations;
7. Perfect for [Jamstack](https://jamstack.org/).

## System design

Based on [E-Com Plus Store API reference](https://developers.e-com.plus/docs/reference/store/):

- REST API on edge functions with [Cloudflare Workers](https://developers.cloudflare.com/workers/) 🚀
- Documents on [Firestore](https://cloud.google.com/firestore) (multi-region recommended) ⛰️
- Webhooks and internal API events with [Pub/Sub](https://cloud.google.com/pubsub) 🔄

> WIP 🚧
