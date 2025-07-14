import { Asset, assetManager, resources } from "cc";

/**
 * ResourceUtil.ts
 * 资源加载管理器（单例模式）
 * 1. 负责加载资源，并对已加载的资源进行缓存。
 * 2. 保证同一资源在运行时只会被加载一次。
 * 3. 处理并发加载，防止同一资源在同一时刻被发起多次加载。
 */
export class ResourceUtil {
    // ------------------- 单例模式实现 -------------------

    // 1. 定义一个私有的静态的自身实例
    private static _instance: ResourceUtil = null;

    /**
     * 2. 提供一个公共的静态的全局访问点
     * @returns ResourceUtil 实例
     */
    public static get instance(): ResourceUtil {
        if (this._instance === null) {
            this._instance = new ResourceUtil();
        }
        return this._instance;
    }

    // 3. 私有化构造函数，防止外部 new
    private constructor() { }

    // ------------------- 核心功能实现 -------------------

    // 已加载的资源缓存 (路径 -> Asset)
    private _assetCache: Map<string, Asset> = new Map();
    // 正在加载中的 Promise 缓存 (路径 -> Promise)
    private _loadingPromises: Map<string, Promise<Asset>> = new Map();

    /**
     * 加载资源
     * @param path 资源在 resources 目录下的路径 (不包含扩展名)
     * @param type 资源的类型 (例: SpriteFrame, Prefab, AudioClip)
     * @returns 返回一个 Promise，该 Promise 在加载成功后会 resolve 对应的资源实例
     */
    public loadAsset<T extends Asset>(path: string, type: typeof Asset): Promise<T> {
        // --- 1. 优先从已加载缓存中获取 ---
        if (this._assetCache.has(path)) {
            // console.log(`[ResourceManager] 从缓存中获取资源: ${path}`);
            const asset = this._assetCache.get(path) as T;
            return Promise.resolve(asset);
        }

        // --- 2. 如果缓存中没有，检查是否正在加载中 ---
        if (this._loadingPromises.has(path)) {
            // console.log(`[ResourceManager] 等待正在加载的资源: ${path}`);
            return this._loadingPromises.get(path) as Promise<T>;
        }

        // --- 3. 如果既没加载过，也没在加载中，则发起新的加载 ---
        // console.log(`[ResourceManager] 发起新的资源加载: ${path}`);
        const loadPromise = new Promise<T>((resolve, reject) => {
            resources.load(path, type, (err, asset) => {
                if (err) {
                    console.error(`[ResourceManager] 资源加载失败: ${path}`, err);
                    // 加载失败，从加载中队列移除
                    this._loadingPromises.delete(path);
                    reject(err);
                    return;
                }

                // 加载成功，存入缓存
                this._assetCache.set(path, asset);
                // 从加载中队列移除
                this._loadingPromises.delete(path);

                // console.log(`[ResourceManager] 资源加载成功: ${path}`);
                resolve(asset as T);
            });
        });

        // 将这个新的加载Promise存入“正在加载”的缓存中
        this._loadingPromises.set(path, loadPromise as Promise<Asset>);

        return loadPromise;
    }

    /**
     * 释放单个资源
     * @param path 资源路径
     */
    public releaseAsset(path: string) {
        if (this._assetCache.has(path)) {
            const asset = this._assetCache.get(path);
            assetManager.releaseAsset(asset);
            this._assetCache.delete(path);
            // console.log(`[ResourceManager] 释放资源: ${path}`);
        }
    }

    /**
     * 释放所有通过本管理器加载的资源
     */
    public releaseAll() {
        this._assetCache.forEach((asset, path) => {
            this.releaseAsset(path);
        });
        this._assetCache.clear();
    }
}